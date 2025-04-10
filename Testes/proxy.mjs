// proxy.mjs
import express from 'express';
import fetch from 'node-fetch';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

const app = express();
app.use(cors());

// Suporte a __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Servir arquivos estáticos (HTML, CSS, JS)
app.use(express.static(__dirname));

// Proxy para Searoutes
app.get('/api/route', async (req, res) => {
  try {
    const response = await fetch('https://api.searoutes.com/route/v2/sea/NLRTM;CNSHA', {
      headers: {
        'Authorization': 'Bearer oq9uwCse383rVggAuJlyy9qZkXKyj7MBo1tA6DM8'
      }
    });

    if (!response.ok) {
      return res.status(response.status).json({ error: 'Erro na API Searoutes' });
    }

    const data = await response.json();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Erro interno no proxy', details: err.message });
  }
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando em http://localhost:${PORT}/index.html`);
});