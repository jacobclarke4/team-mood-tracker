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
