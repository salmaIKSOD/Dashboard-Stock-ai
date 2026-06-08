const express = require('express');
const cors = require('cors');

const stockRoutes = require('./routes/stock');

const app = express();
const PORT = 5001;

app.use(cors({
  origin: 'http://localhost:3001',
  methods: ['GET', 'POST','DELETE', 'PUT', 'OPTIONS'],
  allowedHeaders: ['Content-Type','Authorization'],
}));
app.use(express.json());

app.use('/api', stockRoutes);

app.get('/', (req, res) => {
  res.json({ status: 'ok', message: 'StockAnalytics API en ligne' });
});

// backend/Server/server.js  — ajouter ces 2 lignes
const predictionsRouter = require("./routes/predictions");
app.use("/api/predictions", predictionsRouter);

// app.listen(PORT, () => {
//   console.log(`🚀 Serveur démarré sur http://localhost:${PORT}`);
// });
const server = app.listen(PORT, () => {
  console.log(`🚀 Serveur démarré sur http://localhost:${PORT}`);
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.log(`⚠️ Port ${PORT} occupé, tentative de libération...`);
    const { execSync } = require('child_process');
    try {
      execSync(`for /f "tokens=5" %a in ('netstat -ano ^| findstr :${PORT}') do taskkill /F /PID %a`, { shell: 'cmd.exe' });
      console.log('✅ Port libéré, redémarrage...');
    } catch(e) {
      console.error('❌ Impossible de libérer le port, lance CMD en administrateur');
    }
  }
});