import 'dotenv/config'
import app from './app.js'
import { prisma } from './config/prisma.js'

const port = Number(process.env.PORT) || 5000
if (!process.env.DATABASE_URL) { console.error('Unable to start API: DATABASE_URL is required'); process.exit(1) }
if (!process.env.JWT_SECRET) { console.error('Unable to start API: JWT_SECRET is required'); process.exit(1) }

prisma.$connect()
  .then(() => app.listen(port, () => console.log(`THE KODENAK Studio API running on http://localhost:${port}`)))
  .catch((error) => { console.error(`Unable to start API: ${error.message}`); process.exit(1) })

const shutdown = async () => { await prisma.$disconnect(); process.exit(0) }
process.on('SIGINT', shutdown)
process.on('SIGTERM', shutdown)
