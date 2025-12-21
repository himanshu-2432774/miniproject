const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const Database = require('better-sqlite3');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// Serve static frontend files from project root
app.use(express.static(path.join(__dirname)));

// SQLite DB setup
const DB_PATH = path.join(__dirname, 'data.sqlite');
const db = new Database(DB_PATH);

// Ensure table
db.exec(`
CREATE TABLE IF NOT EXISTS pets (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  years TEXT,
  gender TEXT,
  img TEXT,
  description TEXT
);
`);

// helper to read all pets
function getAllPets() {
  return db.prepare('SELECT id, name, type, years, gender, img, description FROM pets ORDER BY id ASC').all();
}

// helper to get pet by id
function getPetById(id) {
  return db.prepare('SELECT id, name, type, years, gender, img, description FROM pets WHERE id = ?').get(id);
}

// helper to insert pet
function insertPet(pet) {
  const stmt = db.prepare('INSERT INTO pets (name,type,years,gender,img,description) VALUES (@name,@type,@years,@gender,@img,@description)');
  const info = stmt.run(pet);
  return getPetById(info.lastInsertRowid);
}

// GET all pets
app.get('/api/pets', (req, res) => {
  const pets = getAllPets();
  res.json(pets);
});

// GET pet by id
app.get('/api/pets/:id', (req, res) => {
  const id = Number(req.params.id);
  const pet = getPetById(id);
  if (!pet) return res.status(404).json({ error: 'Not found' });
  res.json(pet);
});

// POST add pet (with validation, sanitization & optional API key auth)
app.post('/api/pets', (req, res) => {
  function sanitize(s) {
    return String(s || '').replace(/<[^>]*>/g, '').trim();
  }

  const name = sanitize(req.body.name);
  const typeRaw = sanitize(req.body.type);
  const years = sanitize(req.body.years);
  const gender = sanitize(req.body.gender);
  const img = sanitize(req.body.img);
  const description = sanitize(req.body.description);

  if (!name || !typeRaw) return res.status(400).json({ error: 'name and type required' });
  if (name.length > 100) return res.status(400).json({ error: 'name too long' });

  const allowedTypes = ['dog', 'cat', 'rabbit', 'bird', 'other'];
  const type = allowedTypes.includes(typeRaw.toLowerCase()) ? typeRaw.toLowerCase() : typeRaw;

  // API key check (if ADMIN_API_KEY is set)
  const ADMIN_KEY = process.env.ADMIN_API_KEY;
  if (ADMIN_KEY) {
    const supplied = req.get('x-api-key') || '';
    if (supplied !== ADMIN_KEY) return res.status(401).json({ error: 'unauthorized' });
  }

  const created = insertPet({ name, type, years, gender, img, description });
  res.status(201).json(created);
});

// Only start the server when run directly (for testability)
if (require.main === module) {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
}

module.exports = app;
