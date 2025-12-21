// db-migrate.js — import existing db.json into SQLite (runs once)
const fs = require('fs');
const path = require('path');
const Database = require('better-sqlite3');

const DB_FILE = path.join(__dirname, 'data.sqlite');
const JSON_FILE = path.join(__dirname, 'db.json');

const db = new Database(DB_FILE);

// Create table
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

// Read json and insert
if (fs.existsSync(JSON_FILE)) {
  const data = JSON.parse(fs.readFileSync(JSON_FILE, 'utf8') || '{}');
  if (Array.isArray(data.pets)) {
    const insert = db.prepare('INSERT OR REPLACE INTO pets (id,name,type,years,gender,img,description) VALUES (@id,@name,@type,@years,@gender,@img,@description)');
    const insertMany = db.transaction((rows) => {
      for (const r of rows) insert.run(r);
    });
    insertMany(data.pets.map(p => ({
      id: p.id,
      name: p.name,
      type: p.type || 'other',
      years: p.years || '',
      gender: p.gender || '',
      img: p.img || '',
      description: p.description || ''
    })));
    console.log('Imported', data.pets.length, 'pets into SQLite');
  }
} else {
  console.log('No db.json found — skipping import');
}

console.log('Migration done. DB file at', DB_FILE);
