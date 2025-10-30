import fs from 'fs';
import { Pool } from 'pg';
import dotenv from 'dotenv';
dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  },
  connectionTimeoutMillis: 10000,
});

const data = JSON.parse(fs.readFileSync('october_checkins.json', 'utf8'));

for (const checkin of data) {
  await pool.query(
    `INSERT INTO checkins (team_member_id, mood_rating, energy_level, notes, checkin_date, created_at)
  VALUES ($1, $2, $3, $4, $5, $6)
  ON CONFLICT (team_member_id, checkin_date) 
  DO UPDATE SET 
    mood_rating = EXCLUDED.mood_rating,
    energy_level = EXCLUDED.energy_level,
    notes = EXCLUDED.notes
`,
    [
      checkin.team_member_id,
      checkin.mood_rating,
      checkin.energy_level,
      checkin.notes,
      checkin.checkin_date,
      checkin.created_at,
    ]
  );
}

await pool.end();
