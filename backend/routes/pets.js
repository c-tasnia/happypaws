const express = require('express')
const pool    = require('../db')
const router  = express.Router()

// GET /api/pets — all active pets
router.get('/', async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT id, name, species, emoji, description, goal_amount, raised_amount
       FROM pets WHERE is_active = TRUE ORDER BY created_at DESC`
    )
    res.json(rows)
  } catch (err) {
    console.error('Get pets error:', err)
    res.status(500).json({ message: 'Server error' })
  }
})

module.exports = router
