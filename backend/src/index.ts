import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
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

// API 404 handler
app.use('/api', (req, res) => {
  res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Ruta no encontrada' } });
});

// En producción, servir frontend compilado
if (process.env.NODE_ENV === 'production') {
  const frontendDistPath = path.join(__dirname, '../../frontend/dist');
  app.use(express.static(frontendDistPath));

  // Catch-all para React Router (SPA)
  app.get(/.*/, (req, res) => {
    res.sendFile(path.join(frontendDistPath, 'index.html'));
  });
} else {
  // Manejador 404 para desarrollo (si no es API ni estático)
  app.use((req, res) => {
    res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Ruta no encontrada' } });
  });
}

// Manejador de errores global
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error global:', err);
  res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: 'Error interno del servidor' } });
});

const PORT = process.env.PORT || 3000;

app.listen(Number(PORT), '0.0.0.0', () => {
  console.log(`🚀 Servidor backend escuchando en puerto ${PORT}`);
});
