/**
 * create-zip.js
 * Empaqueta todo el proyecto en proyecto-pintura-industrial.zip
 * Ejecutar: npm run zip   o   node create-zip.js
 *
 * Requiere: npm install archiver --save-dev  (ya está en package.json)
 */

const fs = require('fs');
const path = require('path');
const archiver = require('archiver');

const PROJECT_ROOT = __dirname;
const OUTPUT_FILE = path.join(PROJECT_ROOT, 'proyecto-pintura-industrial.zip');

// Archivos y carpetas a excluir del ZIP
const EXCLUDE = [
  'node_modules',
  '.env',
  '.git',
  'proyecto-pintura-industrial.zip',
  '.DS_Store',
  'Thumbs.db',
];

function shouldExclude(filePath) {
  const relative = path.relative(PROJECT_ROOT, filePath);
  return EXCLUDE.some((ex) => relative === ex || relative.startsWith(ex + path.sep));
}

async function createZip() {
  return new Promise((resolve, reject) => {
    // Eliminar ZIP anterior si existe
    if (fs.existsSync(OUTPUT_FILE)) {
      fs.unlinkSync(OUTPUT_FILE);
      console.log('🗑️  ZIP anterior eliminado.');
    }

    const output = fs.createWriteStream(OUTPUT_FILE);
    const archive = archiver('zip', {
      zlib: { level: 9 }, // máxima compresión
    });

    output.on('close', () => {
      const sizeMB = (archive.pointer() / 1024 / 1024).toFixed(2);
      console.log('');
      console.log('==============================================');
      console.log('  ✅ ZIP generado correctamente');
      console.log(`  📦 Archivo: proyecto-pintura-industrial.zip`);
      console.log(`  📏 Tamaño:  ${sizeMB} MB (${archive.pointer()} bytes)`);
      console.log('==============================================');
      resolve();
    });

    archive.on('error', (err) => {
      reject(err);
    });

    archive.on('warning', (err) => {
      if (err.code === 'ENOENT') {
        console.warn('⚠️  Warning:', err.message);
      } else {
        reject(err);
      }
    });

    archive.pipe(output);

    // Agregar archivos del proyecto de forma recursiva
    function addDirectory(dirPath, zipPath = '') {
      const entries = fs.readdirSync(dirPath, { withFileTypes: true });

      for (const entry of entries) {
        const fullPath = path.join(dirPath, entry.name);
        const entryZipPath = zipPath ? path.join(zipPath, entry.name) : entry.name;

        if (shouldExclude(fullPath)) {
          console.log(`   ⏭️  Excluido: ${entryZipPath}`);
          continue;
        }

        if (entry.isDirectory()) {
          addDirectory(fullPath, entryZipPath);
        } else if (entry.isFile()) {
          archive.file(fullPath, { name: entryZipPath });
          console.log(`   ➕ ${entryZipPath}`);
        }
      }
    }

    console.log('📦 Empaquetando proyecto...\n');
    addDirectory(PROJECT_ROOT);

    archive.finalize();
  });
}

createZip()
  .then(() => {
    console.log('\n🚀 Listo. Ejecutá el ZIP desde el explorador o descomprimilo donde necesites.');
    process.exit(0);
  })
  .catch((err) => {
    console.error('❌ Error al crear el ZIP:', err);
    process.exit(1);
  });
