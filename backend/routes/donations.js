const express = require('express')
const SSLCommerzPayment = require('sslcommerz-lts')
const pool    = require('../db')
const router  = express.Router()

const getSSL = () => new SSLCommerzPayment(
  process.env.SSLCOMMERZ_STORE_ID,
  process.env.SSLCOMMERZ_STORE_PASSWORD,
  process.env.SSLCOMMERZ_IS_LIVE === 'true'
)

// ── POST /api/donate/pay ──────────────────────────────────────
router.post('/pay', async (req, res) => {
  try {
    const { donor_name, donor_email, donor_phone, amount, message, pet_id, is_general } = req.body

    if (!donor_name || !donor_email || !donor_phone || !amount)
      return res.status(400).json({ message: 'Name, email, phone and amount are required' })

    if (Number(amount) < 10)
      return res.status(400).json({ message: 'Minimum donation is ৳10' })

    // Get pet name for the payment description
    let petName = 'General Fund'
    if (pet_id && !is_general) {
      const petResult = await pool.query('SELECT name FROM pets WHERE id = $1', [pet_id])
      if (petResult.rows[0]) petName = petResult.rows[0].name
    }

    const tran_id = `HAPPYPAWS-${Date.now()}-${Math.floor(Math.random() * 9999)}`

    // Save donation as pending
    await pool.query(
      `INSERT INTO donations (pet_id, is_general, donor_name, donor_email, donor_phone, amount, message, tran_id, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'pending')`,
      [
        is_general ? null : (pet_id || null),
        is_general || !pet_id,
        donor_name,
        donor_email,
        donor_phone,
        Number(amount),
        message || null,
        tran_id,
      ]
    )

    const BACKEND  = process.env.BACKEND_URL  || 'http://localhost:5000'
    const FRONTEND = process.env.FRONTEND_URL || 'http://localhost:5173'

    const data = {
      total_amount:     Number(amount),
      currency:         'BDT',
      tran_id,
      success_url:      `${BACKEND}/api/donate/success`,
      fail_url:         `${BACKEND}/api/donate/fail`,
      cancel_url:       `${BACKEND}/api/donate/cancel`,
      ipn_url:          `${BACKEND}/api/donate/ipn`,
      product_name:     `HappyPaws Donation — ${petName}`,
      product_category: 'Donation',
      product_profile:  'general',
      cus_name:         donor_name,
      cus_email:        donor_email,
      cus_phone:        donor_phone,
      cus_add1:         'Bangladesh',
      cus_city:         'Dhaka',
      cus_country:      'Bangladesh',
      ship_name:        donor_name,
      ship_add1:        'Bangladesh',
      ship_city:        'Dhaka',
      ship_country:     'Bangladesh',
      shipping_method:  'NO',
      num_of_item:      1,
      // Pass frontend redirect URLs through SSLCommerz value fields
      value_a: `${FRONTEND}/payment/success`,
      value_b: `${FRONTEND}/payment/fail`,
    }

    const sslResponse = await getSSL().init(data)

    if (!sslResponse?.GatewayPageURL) {
      console.error('SSLCommerz init failed:', sslResponse)
      return res.status(500).json({ message: 'Could not initiate payment. Check SSLCommerz credentials in .env' })
    }

    res.json({ payment_url: sslResponse.GatewayPageURL })
  } catch (err) {
    console.error('Donate pay error:', err)
    res.status(500).json({ message: 'Server error' })
  }
})

// ── POST /api/donate/success ──────────────────────────────────
// SSLCommerz POSTs here after successful payment, then we redirect to frontend
router.post('/success', async (req, res) => {
  try {
    const { tran_id, val_id, status, value_a } = req.body

    if (status !== 'VALID' && status !== 'VALIDATED')
      return res.redirect(`${process.env.FRONTEND_URL}/payment/fail`)

    // Validate with SSLCommerz
    const validation = await getSSL().validate({ val_id })

    if (validation?.status === 'VALID' || validation?.status === 'VALIDATED') {
      // Mark donation as success
      await pool.query(
        'UPDATE donations SET status = $1 WHERE tran_id = $2',
        ['success', tran_id]
      )
      // Update pet raised_amount
      const { rows } = await pool.query(
        'SELECT pet_id, amount, is_general FROM donations WHERE tran_id = $1',
        [tran_id]
      )
      if (rows[0] && rows[0].pet_id && !rows[0].is_general) {
        await pool.query(
          'UPDATE pets SET raised_amount = raised_amount + $1 WHERE id = $2',
          [rows[0].amount, rows[0].pet_id]
        )
      }

      const redirectUrl = value_a || `${process.env.FRONTEND_URL}/payment/success`
      return res.redirect(`${redirectUrl}?tran_id=${tran_id}`)
    }

    res.redirect(`${process.env.FRONTEND_URL}/payment/fail`)
  } catch (err) {
    console.error('Payment success error:', err)
    res.redirect(`${process.env.FRONTEND_URL}/payment/fail`)
  }
})

// ── POST /api/donate/fail ─────────────────────────────────────
router.post('/fail', async (req, res) => {
  const { tran_id, value_b } = req.body
  if (tran_id) {
    await pool.query(
      'UPDATE donations SET status = $1 WHERE tran_id = $2',
      ['failed', tran_id]
    ).catch(() => {})
  }
  res.redirect(value_b || `${process.env.FRONTEND_URL}/payment/fail`)
})

// ── POST /api/donate/cancel ───────────────────────────────────
router.post('/cancel', async (req, res) => {
  const { tran_id, value_b } = req.body
  if (tran_id) {
    await pool.query(
      'UPDATE donations SET status = $1 WHERE tran_id = $2',
      ['failed', tran_id]
    ).catch(() => {})
  }
  res.redirect(value_b || `${process.env.FRONTEND_URL}/payment/fail`)
})

// ── POST /api/donate/ipn ──────────────────────────────────────
// Server-to-server notification from SSLCommerz
router.post('/ipn', async (req, res) => {
  try {
    const { tran_id, val_id, status } = req.body
    if (status === 'VALID' || status === 'VALIDATED') {
      const validation = await getSSL().validate({ val_id })
      if (validation?.status === 'VALID' || validation?.status === 'VALIDATED') {
        await pool.query(
          'UPDATE donations SET status = $1 WHERE tran_id = $2',
          ['success', tran_id]
        )
        const { rows } = await pool.query(
          'SELECT pet_id, amount, is_general FROM donations WHERE tran_id = $1',
          [tran_id]
        )
        if (rows[0]?.pet_id && !rows[0].is_general) {
          await pool.query(
            'UPDATE pets SET raised_amount = raised_amount + $1 WHERE id = $2',
            [rows[0].amount, rows[0].pet_id]
          )
        }
      }
    }
    res.status(200).send('OK')
  } catch (err) {
    console.error('IPN error:', err)
    res.status(200).send('OK') // always respond 200 to SSLCommerz
  }
})

// ── GET /api/donate/verify/:tran_id ───────────────────────────
router.get('/verify/:tran_id', async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT d.tran_id, d.donor_name, d.amount, d.status, d.is_general,
              p.name AS pet_name
       FROM donations d
       LEFT JOIN pets p ON d.pet_id = p.id
       WHERE d.tran_id = $1`,
      [req.params.tran_id]
    )
    if (!rows[0])       return res.status(404).json({ message: 'Transaction not found' })
    if (rows[0].status !== 'success')
                        return res.status(400).json({ message: 'Payment not successful' })

    const result = {
      ...rows[0],
      pet_name: rows[0].is_general ? 'General Fund' : (rows[0].pet_name || 'General Fund'),
    }
    res.json(result)
  } catch (err) {
    console.error('Verify error:', err)
    res.status(500).json({ message: 'Server error' })
  }
})

// ── GET /api/donations/recent ─────────────────────────────────
router.get('/recent', async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT d.donor_name,
              COALESCE(p.name, 'General Fund') AS pet_name,
              d.amount, d.created_at
       FROM donations d
       LEFT JOIN pets p ON d.pet_id = p.id
       WHERE d.status = 'success'
       ORDER BY d.created_at DESC
       LIMIT 10`
    )
    res.json(rows)
  } catch (err) {
    console.error('Recent donations error:', err)
    res.status(500).json({ message: 'Server error' })
  }
})

module.exports = router
