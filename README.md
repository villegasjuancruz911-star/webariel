# Landing Page – Pintura Obrera e Industrial de Gran Envergadura

Proyecto Full-Stack (Node.js + Express + Supabase) orientado a **petroleras, empresas de oil & gas, bases logísticas y grandes comercios** del Alto Valle de Río Negro y Neuquén.

## Stack

- **Backend**: Node.js + Express.js
- **Base de datos**: Supabase (PostgreSQL + RLS)
- **Frontend**: HTML5 semántico + Tailwind CSS (CDN) + JavaScript vanilla
- **Entorno de desarrollo**: Visual Studio Community / VS Code

## Estructura del proyecto

```
proyecto-pintura-industrial/
├── package.json
├── .env.example
├── server.js                 # API Express + integración Supabase
├── create-zip.js             # Script para generar el ZIP del proyecto
├── sql/
│   └── create_table.sql      # Tabla cotizaciones + políticas RLS
├── public/
│   ├── index.html            # Landing page completa
│   ├── css/
│   │   └── styles.css
│   ├── js/
│   │   └── main.js
│   └── assets/               # (opcional) imágenes reales de obras
└── README.md
```

## Instalación rápida

1. **Clonar / descomprimir** el proyecto.

2. **Instalar dependencias**:
   ```bash
   npm install
   ```

3. **Configurar variables de entorno**:
   ```bash
   cp .env.example .env
   ```
   Editar `.env` y completar:
   - `SUPABASE_URL`
   - `SUPABASE_ANON_KEY`
   - `PORT` (opcional, default 3000)

4. **Crear la tabla en Supabase**:
   - Ir a tu proyecto en [supabase.com](https://supabase.com) → SQL Editor
   - Pegar y ejecutar el contenido de `sql/create_table.sql`
   - Verificar que RLS esté habilitado y las políticas creadas

5. **Arrancar el servidor**:
   ```bash
   npm start
   ```
   Abrir http://localhost:3000

## Generar el ZIP del proyecto

Desde la raíz del proyecto:

```bash
npm run zip
```

o

```bash
node create-zip.js
```

Se generará el archivo `proyecto-pintura-industrial.zip` listo para compartir o desplegar.

## Endpoints de la API

| Método | Ruta                 | Descripción                          |
|--------|----------------------|--------------------------------------|
| POST   | `/api/cotizaciones`  | Recibe el formulario de cotización   |
| GET    | `/api/health`        | Health check                         |

El endpoint de cotizaciones tiene rate-limiting (8 requests / 15 min por IP).

## Secciones de la Landing

1. Header / Navbar responsive
2. Hero corporativo con badges de seguridad (ART, HSE, EPP, ISO)
3. Banner de métricas clave
4. Grid de servicios industriales
5. Seguridad y Habilitaciones (enfoque petroleras)
6. Galería de proyectos con filtros
7. Zona de cobertura (Alto Valle + Neuquén)
8. Formulario de cotización conectado a Supabase
9. Footer + botón flotante de WhatsApp

## Personalización recomendada

- Reemplazar el número de WhatsApp en `public/index.html` (buscar `wa.me/549XXXXXXXXXX`)
- Agregar fotos reales de obras en `public/assets/` y actualizar las tarjetas de proyectos
- Completar datos de contacto reales en el Footer
- En producción: ajustar `cors` origin en `server.js` y usar HTTPS

## Licencia

MIT – Uso libre para proyectos comerciales.
