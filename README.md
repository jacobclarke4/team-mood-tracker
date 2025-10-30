
<div>
  <a href='https://mycooknook.com/'>
    <img src ='/public/Logo/moodLogo.svg' width='300' alt='Cooknook Header'> </img>
  </a>
</div>
<br></br>

[Website](https://www.mycooknook.com)

## TL;DR
- A production-grade **Team Mood Tracker Dashboard** for monitoring team wellbeing, mood, and energy trends.  
- Built with **Next.js (SSR)**, **PostgreSql**, and **Recharts** for data visualization.  
- This repository is a curated showcase — the production codebase is private.

## Overview
**Team Mood Tracker** helps organizations and teams measure emotional wellbeing, identify burnout risks, and foster healthy team engagement through daily check-ins and trend analytics.  
Each team member logs mood and energy ratings, which are aggregated into visual dashboards for insights and progress tracking.

## Key Features
- 🧠 **Daily Mood & Energy Check-ins** — Simple and fast daily reflections for each team member.  
- 📈 **Data Visualization Dashboard** — Interactive charts showing mood and energy trends over time.  
- 🗓 **Custom Date Range Filtering** — View analytics for specific timeframes or individuals.  
- 🧍‍♂️ **Member-Level Insights** — Filter results per team member to track personal progress.  
- 🔍 **Real-time Updates** — Data fetched live from Firestore or simulated locally with mock data.  
- ⚙️ **API Integration** — `/api/checkins`, `/api/stats`, and `/api/members` endpoints power dynamic updates.  
- 🧩 **Modular Architecture** — Designed for easy extension to additional metrics like focus, stress, or workload.  
- 🌈 **Emotion Visualization** — Intuitive emoji-based representation of mood and energy averages.

---
<br>

### Getting Started
```bash
# Clone the repo
git clone https://github.com/jacobclarke4/team-mood-tracker.git
cd team-mood-tracker

# Install dependencies
npm install

npm run dev
```
<br>

### Docker
```dockerfile
docker build -t team-mood-tracker .
docker run -p 3000:3000 team-mood-tracker
```
<br>

### POST /api/checkins - Create new check-in
```js
import { NextRequest, NextResponse } from "next/server";
import { query } from "../../../lib/db";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { memberId, mood, energy, notes } = body;
  
  if (!memberId || !mood || !energy) {
    return NextResponse.json({ error: "memberId, mood, energy required" }, { status: 400 });
  }
  
  const result = await query(
  `
  INSERT INTO checkins (team_member_id, mood_rating, energy_level, notes)
  VALUES ($1, $2, $3, $4)
  ON CONFLICT (team_member_id, checkin_date)
  DO UPDATE SET
    mood_rating = EXCLUDED.mood_rating,
    energy_level = EXCLUDED.energy_level,
    notes = EXCLUDED.notes
  RETURNING *;
  `,
  [memberId, mood, energy, notes || null]
);
  
  return NextResponse.json(result.rows[0], { status: 201 });
}
```
<br>

### GET /api/checkins - Retrieve check-ins (with query params for filtering)
```js
export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const startDate = url.searchParams.get("startDate");
  const endDate = url.searchParams.get("endDate");
  const member = url.searchParams.get("teamMemberId");

  let sql = `SELECT * FROM checkins`;
  const conditions: string[] = [];
  const params: (string | number)[] = [];
  let idx = 1;
  if (startDate === "today") {
    conditions.push(`checkin_date::date = CURRENT_DATE`);
  } else {
    if (startDate) {
      conditions.push(`checkin_date >= $${idx++}`);
      params.push(startDate);
    }
    if (endDate) {
      conditions.push(`checkin_date <= $${idx++}`);
      params.push(endDate);
    }
  }
  if (member) {
    conditions.push(`team_member_id = $${idx++}`);
    params.push(member);
  }
  if (conditions.length) sql += " WHERE " + conditions.join(" AND ");
  sql += " ORDER BY checkin_date DESC LIMIT 1000";

  
  const result = await query(sql, params);
  return NextResponse.json(result.rows);
}
```
<br>

### GET /api/stats - Get aggregate statistics
```js
import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET() {
  const avgRes = await query(`SELECT AVG(mood_rating) AS avg_mood, AVG(energy_level) AS avg_energy FROM checkins`);
  
  const avgMood = Number(avgRes.rows[0].avg_mood || 0);
  const avgEnergy = Number(avgRes.rows[0].avg_energy || 0);

  return NextResponse.json({ avgMood, avgEnergy });
}
```
