require('dotenv').config()
const express = require('express')
const cors    = require('cors')
const path    = require('path')

const petsRoutes      = require('./routes/pets')
const donationsRoutes = require('./routes/donations')

const app  = express()
const PORT = process.env.PORT || 5000

// ── Middleware ────────────────────────────────────────────────
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}))
app.use(express.json())
app.use(express.urlencoded({ extended: true })) // needed for SSLCommerz POST callbacks

// ── Routes ────────────────────────────────────────────────────
app.use('/api/pets',        petsRoutes)
app.use('/api/donate',      donationsRoutes)
app.use('/api/donations',   donationsRoutes)

// ── Health check ──────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() })
})

// ── Serve frontend in production ──────────────────────────────
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, 'public')))
  app.get('*', (_, res) => res.sendFile(path.join(__dirname, 'public', 'index.html')))
}

// ── Start ─────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`🐾 HappyPaws backend running → http://localhost:${PORT}`)
  console.log(`   SSLCommerz : ${process.env.SSLCOMMERZ_IS_LIVE === 'true' ? '🟢 LIVE' : '🟡 SANDBOX'}`)
})
