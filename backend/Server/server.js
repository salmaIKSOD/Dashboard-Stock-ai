const express = require('express');
const cors    = require('cors');

const { initDatabase } = require('../db');  // ← import initDatabase
const stockRoutes      = require('./routes/stock');

const app  = express();
const PORT = 5000;

app.use(cors({
  origin: 'http://localhost:3000',
  methods: ['GET', 'POST', 'DELETE', 'PUT', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json());

app.use('/api', stockRoutes);

app.get('/', (req, res) => {
  res.json({ status: 'ok', message: 'StockAnalytics API en ligne' });
});

// ── Démarrage : init SQL d'abord, puis écoute ────────────────
async function start() {
  try {
    // 1. Initialiser la base Test (créer si absente, vérifier si présente)
    await initDatabase();

    // 2. Démarrer le serveur Express
    const server = app.listen(PORT, () => {
      console.log(`🚀 Serveur démarré sur http://localhost:${PORT}`);
    });

    server.on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        console.log(`⚠️  Port ${PORT} occupé, tentative de libération...`);
        const { execSync } = require('child_process');
        try {
          execSync(
            `for /f "tokens=5" %a in ('netstat -ano ^| findstr :${PORT}') do taskkill /F /PID %a`,
            { shell: 'cmd.exe' }
          );
          console.log('✅ Port libéré, redémarrage...');
        } catch (e) {
          console.error('❌ Impossible de libérer le port, lance CMD en administrateur');
        }
      }
    });

  } catch (err) {
    console.error('❌ Erreur critique au démarrage :', err.message);
    console.error('   → Vérifiez votre fichier .env (DB_SERVER, DB_USER, DB_PASSWORD, DB_PORT)');
    process.exit(1);
  }
}

start();

// const express = require('express');
// const cors = require('cors');

// const stockRoutes = require('./routes/stock');

// const app = express();
// const PORT = 5000;

// app.use(cors({
//   origin: 'http://localhost:3000',
//   methods: ['GET', 'POST','DELETE', 'PUT', 'OPTIONS'],
//   allowedHeaders: ['Content-Type','Authorization'],
// }));
// app.use(express.json());

// app.use('/api', stockRoutes);

// app.get('/', (req, res) => {
//   res.json({ status: 'ok', message: 'StockAnalytics API en ligne' });
// });

// const server = app.listen(PORT, () => {
//   console.log(`🚀 Serveur démarré sur http://localhost:${PORT}`);
// });

// server.on('error', (err) => {
//   if (err.code === 'EADDRINUSE') {
//     console.log(`⚠️ Port ${PORT} occupé, tentative de libération...`);
//     const { execSync } = require('child_process');
//     try {
//       execSync(`for /f "tokens=5" %a in ('netstat -ano ^| findstr :${PORT}') do taskkill /F /PID %a`, { shell: 'cmd.exe' });
//       console.log('✅ Port libéré, redémarrage...');
//     } catch(e) {
//       console.error('❌ Impossible de libérer le port, lance CMD en administrateur');
//     }
//   }
// });