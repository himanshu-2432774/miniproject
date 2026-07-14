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
  const id = Number(req.query.id || (req.url && req.url.split('/').pop()));
  if (Number.isNaN(id)) return res.status(400).json({ error: 'invalid id' });

  if (req.method === 'GET') {
    const pet = (db.pets || []).find(p => Number(p.id) === id);
    if (!pet) return res.status(404).json({ error: 'not found' });
    return res.status(200).json(pet);
  }

  res.setHeader('Allow', 'GET');
  res.status(405).end();
};
