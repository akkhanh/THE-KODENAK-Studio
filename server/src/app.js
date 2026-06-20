import cors from 'cors'
import express from 'express'
import adminRoutes from './routes/adminRoutes.js'
import authRoutes from './routes/authRoutes.js'
import orderRoutes from './routes/orderRoutes.js'
import packageRoutes from './routes/packageRoutes.js'
import promoRoutes from './routes/promoRoutes.js'
import { faqRoutes, settingsRoutes } from './routes/contentRoutes.js'
import { errorHandler, notFound } from './middleware/errors.js'

const app = express()
app.disable('x-powered-by')
app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173' }))
app.use(express.json({ limit: '100kb' }))
app.get('/api/health', (_req, res) => res.json({ status: 'ok' }))
app.use('/api/auth', authRoutes)
app.use('/api/packages', packageRoutes)
app.use('/api/promo', promoRoutes)
app.use('/api/faqs', faqRoutes)
app.use('/api/settings', settingsRoutes)
app.use('/api/orders', orderRoutes)
app.use('/api/admin', adminRoutes)
app.use(notFound)
app.use(errorHandler)
export default app
