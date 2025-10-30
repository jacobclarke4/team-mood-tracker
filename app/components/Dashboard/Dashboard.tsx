'use client';
import React, { useEffect, useMemo, useState } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from "recharts";
import { motion } from "framer-motion";
import MemberSelect from "../SelectMenu/SelectMenu";
import { set } from "date-fns";
interface Member {
  id: string | number;
  name: string;
}

// Dashboard component for Team Mood Tracker
// - Fetches data from /api/checkins and /api/stats
// - If no backend is available for local demo, set `USE_MOCK = true` to use generated sample data

const USE_MOCK = false; // set to false when your API is ready

interface CheckIn {
  team_member_id: string;
  mood_rating: number;
  energy_level: number;
  notes: string;
  created_at: string;
  checkin_date: string;
}


// Helper: create 7 days of sample data
function generateMockCheckins(days = 10) {
  const names = ["Alice", "Bob", "Charlie", "Dana", "Eve"];
  const out = [];
  const now = new Date();
  for (let d = 0; d < days; d++) {
    const day = new Date(now);
    day.setDate(now.getDate() - (days - 1 - d));
    const isoDay = day.toISOString().slice(0, 10);
    // random number of checkins per day
    const count = Math.floor(Math.random() * 5) + 1;
    for (let i = 0; i < count; i++) {
      const name = names[Math.floor(Math.random() * names.length)];
      out.push({
        team_member_id: `${isoDay}-${i}-${name}`,
        mood_rating: Math.floor(Math.random() * 5) + 1,
        energy_level: Math.floor(Math.random() * 5) + 1,
        notes: Math.random() > 0.6 ? "Working on a blocker" : "",
        created_at: new Date(day.getTime() + Math.floor(Math.random() * 86400000)).toISOString(),
        checkin_date: isoDay
      });
    }
  }
  return out;
}

function formatDateShort(iso: string | number | Date) {
  const d = new Date(iso);
  return d.toLocaleString();
}

export default function TeamMoodDashboard() {
    const moodEmojis = ['😢', '😕', '😐', '😊', '😄'];
    const energyEmojis = ['😴', '😪', '😑', '💪', '🔥'];
    const [memberMap, setMemberMap] = useState<Record<string, string>>({});
    const [memberList, setMemberList] = useState<Member[]>([]);
    const [member, setMember] = useState<Member | null>(null);
    const [checkins, setCheckins] = useState<CheckIn[]>([]);
    const [todaysCheckins, setTodaysCheckins] = useState<CheckIn[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [stats, setStats] = useState<{ avgMood: number; avgEnergy: number } | null>(null);


    const [startDate, setStartDate] = useState( (() => { const d = new Date(); d.setDate(d.getDate()-6); return d.toISOString().slice(0,10); })());
    const [endDate, setEndDate] = useState(new Date().toISOString().slice(0,10));

    useEffect(() => {
        async function loadStats() {
            const res = await fetch(`/api/stats`);
            if (res.ok) {
                const data = await res.json();
                setStats(data);
            }
        }
        loadStats();
    }, []);

    useEffect(() => {
        async function loadMembers() {
            try {
                const res = await fetch("/api/members");
                if (!res.ok) throw new Error("Failed to fetch members");
                const data = await res.json();

                // Convert array to map
                const map: Record<string, string> = {};
                data.forEach((member: Member) => {
                    map[member.id] = member.name;
                });

                setMemberMap(map);
                setMemberList(data);

            } catch (err) {
                console.error(err);
            }
        }

        loadMembers();
    }, []);

    useEffect(() => {
        async function load() {
            setLoading(true);
            setError(null);
            try {
                if (USE_MOCK) {
                    // simulate network delay
                    await new Promise(r => setTimeout(r, 200));
                    const mock = generateMockCheckins(10);
                    setCheckins(mock);
                } else {
                    // fetch real data from your backend
                    const params = new URLSearchParams();
                    params.set('startDate', startDate);
                    params.set('endDate', endDate);
                    if (member !== null) {
                        params.set('teamMemberId', member.id.toString());
                        console.log("Filtering for member:", member.id);
                    }
                    const res = await fetch(`/api/checkins?${params.toString()}`);
                if (!res.ok) throw new Error(await res.text());
                    const data = await res.json();
                    setCheckins(data);
                }
            } catch (err) {
                console.error(err);
                setError(err instanceof Error ? err.message : String(err));
            } finally {
                setLoading(false);
            }
        }
        load();
    }, [startDate, endDate, member]);

    console.log("checkins", checkins);

    useEffect(() => {
        async function load() {
            setLoading(true);
            setError(null);
            try {
                if (USE_MOCK) {
                    // simulate network delay
                    await new Promise(r => setTimeout(r, 200));
                    const mock = generateMockCheckins(10);
                    setCheckins(mock);
                } else {
                    // fetch real data from your backend
                    const params = new URLSearchParams();
                    params.set('startDate', 'today');

                    const res = await fetch(`/api/checkins?${params.toString()}`);
                if (!res.ok) throw new Error(await res.text());
                    const data = await res.json();
                    setTodaysCheckins(data);
                }
            } catch (err) {
                console.error(err);
                setError(err instanceof Error ? err.message : String(err));
            } finally {
                setLoading(false);
            }
        }
        load();
    }, []);



    const filtered = useMemo(() => {
        return checkins.filter(c => {
        if (member !== null && memberMap[c.team_member_id] !== member.name) return false;
        const date = c.created_at.slice(0,10);
        if (date < startDate || date > endDate) return false;
        return true;
        }).sort((a,b)=> new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    }, [checkins, member, startDate, endDate, memberMap]);

    const filteredDataByDate = useMemo(() => {
        const start = new Date(startDate);
        const end = new Date(endDate);
        const days = [];
        
        // Calculate number of days between start and end
        const dayCount = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
        
        // Generate days from startDate to endDate
        for (let i = 0; i <= dayCount; i++) {
            const d = new Date(start);
            d.setDate(start.getDate() + i);
            days.push(d.toISOString().slice(0,10));
        }
        
        return days.map(day => {
            let dayItems = checkins.filter(c => 
                c.checkin_date.slice(0,10) === day 
            );

            if (member !== null) {
                dayItems = dayItems.filter(c => memberMap[c.team_member_id] === member.name);
            }
            const avgMood = dayItems.length ? (dayItems.reduce((s,c)=>s+c.mood_rating,0)/dayItems.length) : null;
            const avgEnergy = dayItems.length ? (dayItems.reduce((s,c)=>s+c.energy_level,0)/dayItems.length) : null;
            return { day: day.slice(5), avgMood, avgEnergy };
        });
    }, [checkins, startDate, endDate, member, memberMap]);

    console.log("filteredDataByDate", filteredDataByDate);
    // Prepare 7-day trend (past 7 days ending at endDate)
    const trend = useMemo(() => {
        const end = new Date(endDate);
        const days = [];
        for (let i = 6; i >= 0; i--) {
            const d = new Date(end);
            d.setDate(end.getDate() - i);
            days.push(d.toISOString().slice(0,10));
        }
        return days.map(day => {
            const dayItems = checkins.filter(c => c.created_at.slice(0,10) === day && (member === null || memberMap[c.team_member_id] === member.name));
            const avgMood = dayItems.length ? (dayItems.reduce((s,c)=>s+c.mood_rating,0)/dayItems.length) : null;
            const avgEnergy = dayItems.length ? (dayItems.reduce((s,c)=>s+c.energy_level,0)/dayItems.length) : null;
            return { day: day.slice(5), avgMood, avgEnergy };
        });
    }, [checkins, endDate, member]);

  return (
    <div className="max-w-6xl mx-auto">
      <header className="mb-6">
        <h1 className="text-3xl font-bold text-white">Dashboard</h1>
        <p className="text-sm text-white mt-1">Today&apos;s snapshot and recent trend (connects to /api/checkins & /api/stats)</p>
      </header>

      <section className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        <div className="col-span-2 bg-grey rounded-xl p-4 shadow">
          <div className="flex flex-col justify-between mb-4 gap-4">
            <div className="flex flex-col gap-2">
                <label className="text-sm text-white">Member</label>
                <MemberSelect
                    members={memberList} selectedMember={member} onChange={(member) => setMember(member||null)}
                    allowAll={true}
                />
            </div>
            <div className="flex gap-3 items-center">
              <label className="text-sm text-white">From</label>
                <div className="relative w-40 bg-light-grey rounded-xl">
                    <input 
                        type="date" 
                        value={startDate} 
                        onChange={e => setStartDate(e.target.value)}
                        onClick={e => e.currentTarget.showPicker()}
                        className="w-full p-2 text-sm rounded  appearance-none text-white cursor-pointer"
                    />
                    <span className="absolute right-2 top-1/2 transform -translate-y-1/2 text-purple-500 pointer-events-none cursor-pointer">
                        📅
                    </span>
                </div>
              <label className="text-sm text-white">To</label>
              <div className="relative w-40 rounded-xl bg-light-grey ">
                <input 
                    type="date" 
                    value={endDate} 
                    onChange={e => setEndDate(e.target.value)}
                    onClick={e => e.currentTarget.showPicker()}
                    className="w-full p-2 text-sm rounded  appearance-none text-white cursor-pointer"
                />
                <span className="absolute right-2 top-1/2 transform -translate-y-1/2 text-purple-500 pointer-events-none cursor-pointer">
                    📅
                </span>
                </div>
            </div>
            <div className="text-right text-sm text-white">{loading ? 'Loading…' : `${filtered.length} entries`}</div>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={filteredDataByDate} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" stroke="white" />
                <YAxis domain={[1,5]} allowDecimals={true} stroke="white" />
                <Tooltip  />
                <Line type="monotone" dataKey="avgMood" name="Avg Mood" stroke="var(--purple-color)" strokeWidth={3} dot={{ r: 4 }} />
                <Line type="monotone" dataKey="avgEnergy" name="Avg Energy" stroke="var(--light-purple-color)" strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-grey rounded-xl p-4 shadow">
          <h3 className="text-lg font-medium text-white">Metrics (All Time)</h3>
          <div className="mt-4 grid grid-cols-1 gap-3">
            <div className="p-3 rounded-xl bg-light-grey flex items-center justify-between">
              <div>
                <div className="text-xs text-white">Average Mood</div>
                <div className="text-2xl text-white">{stats?.avgMood.toFixed(2)} ({moodEmojis[Math.round(Number(stats?.avgMood)) - 1]})</div>
              </div>
              <div className="text-sm text-white">Scale 1-5</div>
            </div>

            <div className="p-3 rounded-xl bg-light-grey flex items-center justify-between">
              <div>
                <div className="text-xs text-white">Average Energy</div>
                <div className="text-2xl text-white">{stats?.avgEnergy.toFixed(2)} ({energyEmojis[Math.round(Number(stats?.avgEnergy)) - 1]})</div>
              </div>
              <div className="text-sm text-white">Scale 1-5</div>
            </div>

            <div className="p-3 rounded-xl bg-light-grey">
              <div className="text-xs text-white">Today&apos;s submissions</div>
              <div className="text-xl font-semibold text-white">{todaysCheckins.length}</div>
            </div>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="col-span-2">
          <h2 className="text-lg font-medium mb-3 text-white">Today&apos;s Check-ins</h2>
          <div className="space-y-3">
            {todaysCheckins.length === 0 && <div className="p-4 rounded-xl  text-white">No check-ins for today</div>}
            {todaysCheckins.map((c, index) => (
              <motion.div key={index} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="p-4 bg-grey rounded-xl shadow flex justify-between items-start">
                <div>
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-purple flex items-center justify-center font-semibold text-white">{memberMap[c.team_member_id]?.[0] || "?"}</div>
                        <div>
                            <div className="font-semibold text-white">{memberMap[c.team_member_id]}</div>
                            <div className="text-xs text-white">{formatDateShort(c.created_at)}</div>
                        </div>
                    </div>
                </div>
                <div className="text-right text-white">
                    <div className="text-sm">Mood: <span className="font-medium">{c.mood_rating} ({moodEmojis[Math.round(Number(c.mood_rating)) - 1]})</span></div>
                    <div className="text-sm">Energy: <span className="font-medium">{c.energy_level} ({energyEmojis[Math.round(Number(c.energy_level)) - 1]})</span></div>
                    {c.notes && <div className="mt-2 text-xs text-white">{c.notes}</div>}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
      

      {error && <div className="mt-6 text-red-600">Error: {error}</div>}
    </div>
  );
}
