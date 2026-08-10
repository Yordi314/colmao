import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './modules/auth/auth.routes';
import productosRoutes from './modules/productos/productos.routes';
import ventasRoutes from './modules/ventas/ventas.routes';
import fiadoRoutes from './modules/fiado/fiado.routes';
import inventarioRoutes from './modules/inventario/inventario.routes';
import dashboardRoutes from './modules/dashboard/dashboard.routes';

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// Logging middleware básico
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Rutas base
app.use('/api/auth', authRoutes);
app.use('/api', productosRoutes);
app.use('/api', ventasRoutes);
app.use('/api', fiadoRoutes);
app.use('/api', inventarioRoutes);
app.use('/api', dashboardRoutes);

// Manejador 404
app.use((req, res) => {
  res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Ruta no encontrada' } });
});

// Manejador de errores global
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error global:', err);
  res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: 'Error interno del servidor' } });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🚀 Servidor backend escuchando en http://localhost:${PORT}`);
});
