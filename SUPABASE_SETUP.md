# Supabase Setup Guide

## Step 1: Create a Supabase Account & Project
1. Go to [https://app.supabase.com](https://app.supabase.com)
2. Sign up or log in
3. Click "New Project" and create a project
4. Wait for it to initialize (takes a minute)

## Step 2: Create the `pets` Table
In your Supabase dashboard:
1. Go to **SQL Editor** (left sidebar)
2. Click **New Query**
3. Copy and paste this SQL:

```sql
CREATE TABLE pets (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  years TEXT,
  gender TEXT,
  img TEXT,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

4. Click **Run**

## Step 3: Create the `adoption_applications` Table
In the **SQL Editor**, click **New Query** and run:

```sql
CREATE TABLE adoption_applications (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  pet_name TEXT NOT NULL,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  zipcode TEXT NOT NULL,
  home_type TEXT,
  home_ownership TEXT,
  yard_size TEXT,
  pet_experience TEXT,
  other_pets TEXT,
  other_pets_description TEXT,
  vet_info TEXT,
  reference TEXT,
  why_adopt TEXT NOT NULL,
  agree_terms BOOLEAN DEFAULT FALSE,
  submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  status TEXT DEFAULT 'pending'
);
```

4. Click **Run**

## Step 4: Get Your Credentials
1. Go to **Settings** (bottom of left sidebar)
2. Click **API** 
3. Copy:
   - **Project URL** → `SUPABASE_URL`
   - **anon public** key → `SUPABASE_KEY`

## Step 5: Update `.env` File
Open `.env` in your project and replace:
```
SUPABASE_URL=your_project_url
SUPABASE_KEY=your_anon_key
ADMIN_API_KEY=your_secret_key_here (optional)
PORT=3000
NODE_ENV=development
```

## Step 6: Install Supabase Client (if not already installed)
```bash
npm install @supabase/supabase-js
```

## Step 7: Start Your Server
```bash
npm run dev
```

Your API is now connected to Supabase! 🎉

## Testing

### Pets API
- GET all pets: `http://localhost:3000/api/pets`
- GET pet by ID: `http://localhost:3000/api/pets/1`
- POST new pet: Send to `/api/pets` with JSON body

### Adoption API
- POST adoption application: Send to `/api/adoptions` with JSON body
- Example request:
```json
{
  "petName": "Luna",
  "fullName": "John Doe",
  "email": "john@example.com",
  "phone": "555-1234",
  "address": "123 Main St",
  "city": "Your City",
  "state": "Your State",
  "zipcode": "12345",
  "homeType": "house",
  "homeOwnership": "own",
  "yardSize": "large",
  "petExperience": "yes",
  "otherPets": "no",
  "additionalInfo": "I would love to adopt",
  "agreeTerms": true
}
```

## Enable RLS (Row Level Security) - Optional
For production, go to **Authentication** → **Policies** and set up RLS rules to restrict data access.

## Migration from SQLite
If you have data in your local SQLite database, you can:
1. Export from SQLite
2. Import to Supabase using the dashboard or API

Need help? Check the [Supabase docs](https://supabase.com/docs)
