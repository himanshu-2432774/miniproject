# Adoption Form Setup Guide

## Overview
The adoption form is now connected to Supabase to store all submissions in a database. Follow these steps to set up the Supabase integration.

## Step 1: Create Supabase Account & Project
1. Visit [https://app.supabase.com](https://app.supabase.com)
2. Sign up or log in
3. Create a new project
4. Wait for initialization (about 1 minute)

## Step 2: Create adoption_applications Table
In your Supabase dashboard:

1. Go to **SQL Editor** (left sidebar)
2. Click **New Query**
3. Copy and run this SQL:

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

## Step 3: Get API Credentials
1. Click **Settings** (bottom left)
2. Click **API**
3. Copy:
   - **Project URL** (your SUPABASE_URL)
   - **anon public** key (your SUPABASE_KEY)

## Step 4: Configure .env File
Open the `.env` file in your project root and update:

```env
SUPABASE_URL=your_project_url_here
SUPABASE_KEY=your_anon_key_here
ADMIN_API_KEY=your_admin_key_here
PORT=3000
NODE_ENV=development
```

## Step 5: Start the Server
```bash
npm run dev
```

## Form Features

### How It Works
1. User clicks "Adopt Now" button on pet details page
2. Modal form opens with adoption application
3. User fills out all required information
4. Form submitted to API endpoint: `POST /api/adoptions`
5. Data saved to Supabase `adoption_applications` table
6. Success message displayed to user

### Form Fields Collected
- **Personal Info**: Name, Email, Phone
- **Address**: Address, City, State, Zip
- **Living Situation**: Home type, Ownership, Yard size
- **Pet Experience**: Experience level, Other pets
- **References**: Vet info, Personal reference
- **Additional**: Why adopt this pet, Terms agreement

### API Endpoint
**POST** `/api/adoptions`

Example request:
```json
{
  "petName": "Luna",
  "fullName": "John Doe",
  "email": "john@example.com",
  "phone": "555-1234",
  "address": "123 Main St",
  "city": "San Francisco",
  "state": "CA",
  "zipcode": "94102",
  "homeType": "house",
  "homeOwnership": "own",
  "yardSize": "large",
  "petExperience": "yes",
  "otherPets": "no",
  "otherPetsDesc": "",
  "vetName": "Dr. Smith",
  "reference": "Jane Doe 555-5678",
  "additionalInfo": "I've always wanted a dog",
  "agreeTerms": true
}
```

Response on success:
```json
{
  "success": true,
  "message": "Application submitted successfully",
  "data": { ... application data ... }
}
```

## Testing
1. Visit the pet details page: `http://localhost:3000/pet.html?id=1`
2. Click "Adopt Now" button
3. Fill out the form
4. Click "Submit Application"
5. Check Supabase dashboard → **adoption_applications** table to verify data was saved

## Fallback Mode
If Supabase credentials are not configured, the API will still accept submissions but save them locally instead of to the database.

## Frontend Changes Made
- Modified `pet.html`: Added adoption form modal with complete form fields
- Updated `css/pet.css`: Added styling for modal and form elements
- Enhanced `js/pet.js`: Added form handling and API submission logic

## Backend Changes Made
- Updated `server.js`: Added `/api/adoptions` endpoint with Supabase integration
- Integrated `@supabase/supabase-js` client library
- Implemented data sanitization and validation

## Future Enhancements
- Add email notifications when applications are submitted
- Create admin dashboard to view/manage applications
- Add application status tracking
- Implement automated email confirmations to applicants
- Add file uploads (photos, documents)
