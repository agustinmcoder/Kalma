import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { logger } from 'hono/logger'

import authRoutes from './routes/auth.js'
import sesionesRoutes from './routes/sesiones.js'
import pacientesRoutes from './routes/pacientes.js'
import comprobantesRoutes from './routes/comprobantes.js'
import documentosRoutes from './routes/documentos.js'
import membresiaRoutes from './routes/membresia.js'

const app = new Hono()

// Middlewares globales
app.use('*', logger())
app.use('*', cors({
  origin: ['http://localhost:5173', 'https://kalma.pages.dev'],
  allowMethods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
}))

// Health check
app.get('/', (c) => c.json({ status: 'ok', app: 'Kalma API' }))

// Rutas
app.route('/auth', authRoutes)
app.route('/sesiones', sesionesRoutes)
app.route('/pacientes', pacientesRoutes)
app.route('/comprobantes', comprobantesRoutes)
app.route('/documentos', documentosRoutes)
app.route('/membresia', membresiaRoutes)

export default app
