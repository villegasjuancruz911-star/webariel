/**
 * server.js
 * Backend Express + Supabase
 * Landing Page - Pintura Obrera e Industrial de Gran Envergadura
 * Alto Valle de Río Negro y Neuquén
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// ======================
// Configuración
// ======================
const PORT = process.env.PORT || 3000;
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('❌ ERROR: Faltan variables de entorno SUPABASE_URL o SUPABASE_ANON_KEY');
  console.error('   Copia .env.example a .env y completa los valores.');
  process.exit(1);
}

// Cliente Supabase (usa anon key + RLS)
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const app = express();

// ======================
// Middlewares de seguridad y utilidades
// ======================
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://cdn.tailwindcss.com", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      scriptSrc: ["'self'", "'unsafe-inline'", "https://cdn.tailwindcss.com"],
      imgSrc: ["'self'", "data:", "https:", "blob:"],
      connectSrc: ["'self'", SUPABASE_URL],
    },
  },
}));

app.use(cors({
  origin: process.env.NODE_ENV === 'production'
    ? ['https://tudominio.com'] // Reemplazar en producción
    : true,
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type'],
}));

app.use(morgan('dev'));
app.use(express.json({ limit: '32kb' }));
app.use(express.urlencoded({ extended: true, limit: '32kb' }));

// Rate limiting para el endpoint de cotizaciones
const cotizacionLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 8, // máximo 8 solicitudes por IP
  message: {
    success: false,
    error: 'Demasiadas solicitudes. Intente nuevamente en 15 minutos.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// ======================
// Archivos estáticos
// ======================
app.use(express.static(path.join(__dirname, 'public')));

// ======================
// Rutas API
// ======================

/**
 * POST /api/cotizaciones
 * Recibe el formulario de cotización corporativa y lo inserta en Supabase
 */
app.post('/api/cotizaciones', cotizacionLimiter, async (req, res) => {
  try {
    const {
      empresa,
      cuit,
      nombre_contacto,
      telefono,
      tipo_obra,
      ubicacion,
      metros_cuadrados,
      mensaje,
    } = req.body;

    // Validación básica de campos obligatorios
    const required = { empresa, cuit, nombre_contacto, telefono, tipo_obra, ubicacion };
    const missing = Object.entries(required)
      .filter(([, v]) => !v || String(v).trim() === '')
      .map(([k]) => k);

    if (missing.length > 0) {
      return res.status(400).json({
        success: false,
        error: `Campos obligatorios faltantes: ${missing.join(', ')}`,
      });
    }

    // Sanitización simple
    const payload = {
      empresa: String(empresa).trim().slice(0, 200),
      cuit: String(cuit).trim().slice(0, 20),
      nombre_contacto: String(nombre_contacto).trim().slice(0, 120),
      telefono: String(telefono).trim().slice(0, 30),
      tipo_obra: String(tipo_obra).trim().slice(0, 50),
      ubicacion: String(ubicacion).trim().slice(0, 150),
      metros_cuadrados: metros_cuadrados
        ? parseFloat(String(metros_cuadrados).replace(',', '.'))
        : null,
      mensaje: mensaje ? String(mensaje).trim().slice(0, 2000) : null,
      estado: 'pendiente',
    };

    // Validar metros cuadrados si se envió
    if (payload.metros_cuadrados !== null && (isNaN(payload.metros_cuadrados) || payload.metros_cuadrados < 0)) {
      return res.status(400).json({
        success: false,
        error: 'El valor de metros cuadrados no es válido.',
      });
    }

    // Insertar en Supabase
    const { data, error } = await supabase
      .from('cotizaciones')
      .insert([payload])
      .select('id, created_at')
      .single();

    if (error) {
      console.error('Supabase error:', error);
      return res.status(500).json({
        success: false,
        error: 'Error al registrar la solicitud. Intente nuevamente.',
      });
    }

    console.log(`✅ Nueva cotización registrada: ${data.id} - ${payload.empresa}`);

    return res.status(201).json({
      success: true,
      message: 'Solicitud de cotización recibida correctamente. Nos contactaremos a la brevedad.',
      id: data.id,
      created_at: data.created_at,
    });
  } catch (err) {
    console.error('Error inesperado en /api/cotizaciones:', err);
    return res.status(500).json({
      success: false,
      error: 'Error interno del servidor.',
    });
  }
});

/**
 * GET /api/health
 * Health check simple
 */
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    service: 'pintura-industrial-api',
    timestamp: new Date().toISOString(),
  });
});

// ======================
// Fallback SPA / Landing
// ======================
app.get('*', (_req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ======================
// Arranque del servidor
// ======================
app.listen(PORT, () => {
  console.log('==============================================');
  console.log('  🏗️  Pintura Industrial - Landing Page API');
  console.log(`  ✅ Servidor escuchando en http://localhost:${PORT}`);
  console.log('  📋 Endpoints:');
  console.log('     POST /api/cotizaciones');
  console.log('     GET  /api/health');
  console.log('==============================================');
});
