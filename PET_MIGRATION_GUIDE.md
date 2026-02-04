# Pet Data Migration to Supabase Guide

## Overview
This guide explains how to migrate all 17 pets from your local `db.json` file to Supabase database.

## Prerequisites
1. Supabase account and project created
2. `.env` file configured with Supabase credentials:
   ```
   SUPABASE_URL=your_project_url
   SUPABASE_KEY=your_anon_key
   ```
3. `pets` table created in Supabase (see [SUPABASE_SETUP.md](SUPABASE_SETUP.md))

## Step 1: Verify Supabase Connection
Start your server:
```bash
npm run dev
```

Check the console output for:
```
✓ Supabase connected
```

If you see an error, verify your `.env` file has correct credentials.

## Step 2: Run Migration Endpoint
Make a POST request to the migration endpoint. You can use:

### Option A: Using curl
```bash
curl -X POST http://localhost:3000/api/migrate-pets
```

### Option B: Using Postman
1. Create new POST request
2. URL: `http://localhost:3000/api/migrate-pets`
3. Click **Send**

### Option C: Using VS Code REST Client Extension
Create a file called `migrate.http`:
```http
POST http://localhost:3000/api/migrate-pets
Content-Type: application/json
```

### Option D: Using JavaScript/Node.js
```javascript
fetch('http://localhost:3000/api/migrate-pets', {
  method: 'POST'
})
.then(res => res.json())
.then(data => console.log(data))
.catch(err => console.error(err));
```

## Step 3: Verify Migration
Look for success response:
```json
{
  "success": true,
  "message": "Successfully migrated 17 pets to Supabase",
  "petsMigrated": 17,
  "data": [ ... ]
}
```

Then verify in Supabase dashboard:
1. Go to **Supabase Dashboard**
2. Click **pets** table
3. You should see all 17 pets with data

## Step 4: Test Functionality
Now the app will:
- ✅ Fetch pets from Supabase instead of local file
- ✅ Display all 17 pets on the homepage
- ✅ Show pet details when clicked
- ✅ Save adoption applications to Supabase

## Pets Being Migrated
The following 17 pets will be migrated:

### Dogs (9)
1. Poodle Mix - Female, 3 years
2. Bulldog - Male, 4 years
3. Shih Tzu - Female, 2 years
4. Golden - Male, 2 years
5. Buddy - Male, 5 years
6. Luna - Female, 3 years
7. Max - Male, 6 years
8. Frost - Male, 4 years
9. German Shepherd - Male, 3 years
10. Chihuahua - Female, 2 years

### Cats (2)
11. Luna - Female, 1 year
12. Milo - Male, 2 years

### Other Animals (6)
13. Coco (Bird/Parrot) - Male, 8 months
14. Moti (Duck) - Female, 2 years
15. Snowy (Hamster) - Male, 10 months
16. Nemo (Fish) - Male, 6 months
17. Lovebird (Kiwi Bird) - Male, 1.2 years

## Fallback Mode
If Supabase is not configured:
- GET /api/pets will fetch from local `db.json`
- POST /api/migrate-pets will return an error asking to configure Supabase
- Everything still works locally!

## Important Notes
- **No data is deleted**: Your local `db.json` remains unchanged
- **Auto-increment IDs**: Supabase will generate new sequential IDs (1-17)
- **Image paths**: Images remain as relative paths (./images/...)
- **One-time migration**: Once migrated, you can use Supabase as your primary database

## Troubleshooting

### "Supabase is not connected"
- Check `.env` file has `SUPABASE_URL` and `SUPABASE_KEY`
- Verify credentials are correct
- Restart the server

### "Failed to migrate pets"
- Check Supabase dashboard for any error messages
- Ensure `pets` table exists
- Check table permissions (RLS might be blocking inserts)

### "No pets in Supabase after migration"
- Run migration endpoint again
- Check Supabase dashboard → pets table
- Look for any error messages in server logs

## After Migration
Your app will now:
- Fetch pets from Supabase (faster and scalable)
- Store adoption applications in Supabase
- Have a cloud-based database instead of local JSON

## Next Steps
1. Remove local dependency on `db.json` (optional)
2. Add admin dashboard to manage pets on Supabase
3. Set up Row Level Security (RLS) policies for production
4. Configure email notifications for adoption applications
