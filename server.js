const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// Serve static frontend files from project root
app.use(express.static(path.join(__dirname)));

// Local JSON database
const dbPath = path.join(__dirname, 'db.json');

// Supabase initialization
let supabase = null;
const initSupabase = async () => {
  try {
    const { createClient } = require('@supabase/supabase-js');
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_KEY;
    
    if (supabaseUrl && supabaseKey) {
      supabase = createClient(supabaseUrl, supabaseKey);
      console.log('✓ Supabase connected');
    } else {
      console.log('⚠ Supabase credentials not found in .env');
    }
  } catch (err) {
    console.error('⚠ Supabase initialization failed:', err.message);
  }
};

// Initialize Supabase on startup
initSupabase();

// Read database
function readDb() {
  try {
    const data = fs.readFileSync(dbPath, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    return { pets: [] };
  }
}

// Write database
function writeDb(data) {
  fs.writeFileSync(dbPath, JSON.stringify(data, null, 2), 'utf8');
}

// Get next ID
function getNextId() {
  const db = readDb();
  if (db.pets.length === 0) return 1;
  return Math.max(...db.pets.map(p => p.id || 0)) + 1;
}

// helper to read all pets
async function getAllPets() {
  const db = readDb();
  return db.pets || [];
}

// helper to get pet by id
async function getPetById(id) {
  const db = readDb();
  const pet = db.pets.find(p => p.id === id);
  return pet || null;
}

// helper to insert pet
async function insertPet(pet) {
  const db = readDb();
  const newPet = {
    id: getNextId(),
    ...pet,
    created_at: new Date().toISOString()
  };
  db.pets.push(newPet);
  writeDb(db);
  return newPet;
}

// helper to delete pet
async function deletePet(id) {
  const db = readDb();
  db.pets = db.pets.filter(p => p.id !== id);
  writeDb(db);
}

// GET all pets
app.get('/api/pets', async (req, res) => {
  try {
    let pets;
    
    // Try to fetch from Supabase first if connected
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('pets')
          .select('*')
          .order('id', { ascending: true });
        
        if (error) {
          console.warn('Supabase fetch failed, falling back to local db:', error.message);
          pets = await getAllPets();
        } else if (data && data.length > 0) {
          console.log('✓ Fetched pets from Supabase');
          pets = data;
        } else {
          console.log('No pets in Supabase, using local db');
          pets = await getAllPets();
        }
      } catch (err) {
        console.warn('Supabase error, falling back to local db:', err.message);
        pets = await getAllPets();
      }
    } else {
      pets = await getAllPets();
    }
    
    res.json(pets);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch pets' });
  }
});

// GET pet by id
app.get('/api/pets/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    const pet = await getPetById(id);
    if (!pet) return res.status(404).json({ error: 'Not found' });
    res.json(pet);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch pet' });
  }
});

// POST add pet (with validation, sanitization & optional API key auth)
app.post('/api/pets', async (req, res) => {
  try {
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

    const created = await insertPet({ name, type, years, gender, img, description });
    res.status(201).json(created);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create pet' });
  }
});

// DELETE pet by id
app.delete('/api/pets/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    
    // API key check (if ADMIN_API_KEY is set)
    const ADMIN_KEY = process.env.ADMIN_API_KEY;
    if (ADMIN_KEY) {
      const supplied = req.get('x-api-key') || '';
      if (supplied !== ADMIN_KEY) return res.status(401).json({ error: 'unauthorized' });
    }

    await deletePet(id);
    res.json({ message: 'Pet deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete pet' });
  }
});

// POST adoption application to Supabase
app.post('/api/adoptions', async (req, res) => {
  try {
    // Sanitize input
    function sanitize(s) {
      return String(s || '').replace(/<[^>]*>/g, '').trim();
    }

    const application = {
      pet_name: sanitize(req.body.petName),
      full_name: sanitize(req.body.fullName),
      email: sanitize(req.body.email),
      phone: sanitize(req.body.phone),
      address: sanitize(req.body.address),
      city: sanitize(req.body.city),
      state: sanitize(req.body.state),
      zipcode: sanitize(req.body.zipcode),
      home_type: sanitize(req.body.homeType),
      home_ownership: sanitize(req.body.homeOwnership),
      yard_size: sanitize(req.body.yardSize),
      pet_experience: sanitize(req.body.petExperience),
      other_pets: sanitize(req.body.otherPets),
      other_pets_description: sanitize(req.body.otherPetsDesc),
      vet_info: sanitize(req.body.vetName),
      reference: sanitize(req.body.reference),
      why_adopt: sanitize(req.body.additionalInfo),
      agree_terms: req.body.agreeTerms === true || req.body.agreeTerms === 'on',
      submitted_at: new Date().toISOString()
    };

    // Validate required fields
    if (!application.full_name || !application.email || !application.phone) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // If Supabase is connected, save to database
    if (supabase) {
      const { data, error } = await supabase
        .from('adoption_applications')
        .insert([application])
        .select();

      if (error) {
        console.error('Supabase error:', error);
        return res.status(500).json({ error: 'Failed to save application to database' });
      }

      res.status(201).json({ 
        success: true, 
        message: 'Application submitted successfully',
        data: data[0]
      });
    } else {
      // Fallback: save to local JSON if Supabase is not available
      console.log('Saving adoption application to local database');
      res.status(201).json({ 
        success: true, 
        message: 'Application submitted successfully (saved locally)',
        data: application
      });
    }
  } catch (err) {
    console.error('Error submitting adoption application:', err);
    res.status(500).json({ error: 'Failed to submit adoption application' });
  }
});

// POST endpoint to migrate all pets from db.json to Supabase
app.post('/api/migrate-pets', async (req, res) => {
  try {
    if (!supabase) {
      return res.status(400).json({ error: 'Supabase is not connected. Please configure SUPABASE_URL and SUPABASE_KEY in .env' });
    }

    const db = readDb();
    const pets = db.pets || [];

    if (pets.length === 0) {
      return res.status(400).json({ error: 'No pets found in db.json' });
    }

    // Prepare pets for Supabase (remove id since it will be auto-generated)
    const petsToInsert = pets.map(pet => ({
      name: String(pet.name || '').replace(/<[^>]*>/g, '').trim(),
      type: String(pet.type || '').replace(/<[^>]*>/g, '').trim(),
      years: String(pet.years || '').replace(/<[^>]*>/g, '').trim(),
      gender: String(pet.gender || '').replace(/<[^>]*>/g, '').trim(),
      img: String(pet.img || '').replace(/<[^>]*>/g, '').trim(),
      description: String(pet.description || '').replace(/<[^>]*>/g, '').trim()
    }));

    // Insert all pets into Supabase
    const { data, error } = await supabase
      .from('pets')
      .insert(petsToInsert)
      .select();

    if (error) {
      console.error('Supabase migration error:', error);
      return res.status(500).json({ 
        error: 'Failed to migrate pets to Supabase',
        details: error.message
      });
    }

    console.log(`✓ Successfully migrated ${data.length} pets to Supabase`);
    res.status(200).json({ 
      success: true,
      message: `Successfully migrated ${data.length} pets to Supabase`,
      petsMigrated: data.length,
      data: data
    });
  } catch (err) {
    console.error('Error during pet migration:', err);
    res.status(500).json({ error: 'Failed to migrate pets', details: err.message });
  }
});

// Only start the server when run directly (for testability)
if (require.main === module) {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
}

module.exports = app;
