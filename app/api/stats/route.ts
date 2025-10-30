import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET() {
  const avgRes = await query(`SELECT AVG(mood_rating) AS avg_mood, AVG(energy_level) AS avg_energy FROM checkins`);
  
  const avgMood = Number(avgRes.rows[0].avg_mood || 0);
  const avgEnergy = Number(avgRes.rows[0].avg_energy || 0);

  return NextResponse.json({ avgMood, avgEnergy });
}

