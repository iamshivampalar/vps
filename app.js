import express from 'express';
import path from 'path';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import { sequelize } from './models/index.js';
import { runSeeder } from './config/seeder.js';

// Load environmental parameters
dotenv.config();

// Imported routing pathways
import publicRoutes from './routes/publicRoutes.js';
import authRoutes from './routes/authRoutes.js';
import studentRoutes from './routes/studentRoutes.js';
import adminRoutes from './routes/adminRoutes.js';

const app = express();
const PORT = process.env.PORT || 3000;

// Setup Template View Engine properties
app.set('view engine', 'ejs');
app.set('views', path.join(process.cwd(), 'views'));

// Core Parsing middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Static file hosting configurations (CSS, static files, uploads, generated PDF certificates)
app.use(express.static(path.join(process.cwd(), 'public')));

// Global local variables configuration (inject year, title fallback, success/error toasts)
app.use((req, res, next) => {
  res.locals.siteTitle = 'InternSpace';
  res.locals.currentYear = new Date().getFullYear();
  res.locals.successMsg = req.query.success || null;
  res.locals.errorMsg = req.query.error || null;
  next();
});

// Register Core Router Routes
app.use('/', publicRoutes);
app.use('/auth', authRoutes);
app.use('/student', studentRoutes);
app.use('/admin', adminRoutes);

// Custom 404 Route handler
app.use('*', (req, res) => {
  res.status(404).render('error', { 
    title: '404 - Page Not Found', 
    message: 'The requested resource link has moved or does not exist.' 
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('[System Global Error]:', err);
  const title = 'System Operational Failure';
  const message = err.message || 'The platform was unable to complete the request.';
  
  if (req.xhr || req.headers.accept?.indexOf('json') > -1) {
    return res.status(500).json({ error: message });
  }
  
  res.status(err.status || 500).render('error', { title, message });
});

// Bootloader syncing services & database models
async function startApplication() {
  try {
    console.log('[System Bootloader] Synching relational models database schema...');
    
    // Connect to and sync database tables
    await sequelize.authenticate();
    console.log('[System Bootloader] Connection successfully established with storage engine.');
    
    // Sync schemas (automatically creates SQLite or MySQL tables matching models)
    await sequelize.sync({ alter: true });
    console.log('[System Bootloader] Schema synced successfully.');

    // Execute Seeder values
    await runSeeder();

    // Start Express listener
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`====================================================`);
      console.log(`🚀 ENTERPRISE INTERNSHIP PLATFORM START SUCCESS!`);
      console.log(`🔊 Listening on: http://0.0.0.0:${PORT}`);
      console.log(`📅 Current Local Time: ${new Date().toISOString()}`);
      console.log(`====================================================`);
    });
  } catch (error) {
    console.error('CRITICAL FATAL: System startup failed:', error);
    process.exit(1);
  }
}

startApplication();
