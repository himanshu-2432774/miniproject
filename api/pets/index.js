const fs = require('fs');
const path = require('path');

function readDb() {
  const dbPath = path.join(__dirname, '..', '..', 'db.json');
  try {
    const raw = fs.readFileSync(dbPath, 'utf8');
    return JSON.parse(raw);
  } catch (e) {
    return { pets: [] };
  }
}

module.exports = async (req, res) => {
  const db = readDb();
  if (req.method === 'GET') {
    res.setHeader('Content-Type', 'application/json');
    return res.status(200).json(db.pets || []);
  }

  if (req.method === 'POST') {
    // Accept and echo created pet, but do not persist (serverless filesystem is ephemeral)
    let body = req.body;
    if (!body) {
      try {
        body = JSON.parse(await new Promise((r, rej) => {
          let s = '';
          req.on('data', c => s += c);
          req.on('end', () => r(s || '{}'));
          req.on('error', rej);
        }));
      } catch (e) {
        body = {};
      }
    }

    const nextId = (db.pets && db.pets.length) ? Math.max(...db.pets.map(p => p.id || 0)) + 1 : 1;
    const created = { id: nextId, ...body, created_at: new Date().toISOString() };
    return res.status(201).json(created);
  }

  res.setHeader('Allow', 'GET, POST');
  res.status(405).end();
};
