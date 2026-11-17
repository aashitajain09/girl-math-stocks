const express = require('express');
const cors = require('cors');
require('dotenv').config();

const glossary = require('./data/glossary');
const { quotes, scenarios } = require('./data/content');

const app = express();
// 5000 is taken by AirPlay Receiver on recent macOS, so default to 5050.
const PORT = process.env.PORT || 5050;
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || 'http://localhost:3000';

// The Next.js BFF calls us server-to-server, but allow the client origin for direct browser calls too.
app.use(cors({ origin: CLIENT_ORIGIN }));
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'server-node' });
});

// GET /api/girl-math-quote -> one random quote
app.get('/api/girl-math-quote', (req, res) => {
  res.json(quotes[Math.floor(Math.random() * quotes.length)]);
});

// GET /api/quotes -> all quotes
app.get('/api/quotes', (req, res) => {
  res.json({ quotes });
});

// GET /api/dictionary?q=term&tag=Basics -> filtered glossary
app.get('/api/dictionary', (req, res) => {
  const q = String(req.query.q || '').trim().toLowerCase().slice(0, 80);
  const tag = String(req.query.tag || '').trim().toLowerCase();
  const entries = glossary.filter((e) => {
    const matchesQ = !q || [e.term, e.wallStreet, e.girlMath, e.tag].some((f) => f.toLowerCase().includes(q));
    const matchesTag = !tag || e.tag.toLowerCase() === tag;
    return matchesQ && matchesTag;
  });
  res.json({ entries });
});

// GET /api/dictionary/:id -> single entry
app.get('/api/dictionary/:id', (req, res) => {
  const entry = glossary.find((e) => e.id === req.params.id);
  if (!entry) return res.status(404).json({ error: 'No translation for that term yet.' });
  res.json(entry);
});

// GET /api/scenarios -> "Free Money" calculator presets
app.get('/api/scenarios', (req, res) => {
  res.json({ scenarios });
});

app.use((req, res) => {
  res.status(404).json({ error: `No route for ${req.method} ${req.path}` });
});

app.listen(PORT, () => {
  console.log(`Node server running on http://localhost:${PORT}`);
});
