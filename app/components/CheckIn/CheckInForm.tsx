'use client'
import React, { useEffect, useState } from "react";
import MemberSelect from "../SelectMenu/SelectMenu";

export type Member = { id: string | number; name: string };

const SAMPLE_MEMBERS: Member[] = [
  { id: 1, name: "Alex" },
  { id: 2, name: "Jamie" },
  { id: 3, name: "Sam" },
  { id: 4, name: "Morgan" }
];

export default function CheckinForm({ onSubmitted }: { onSubmitted?: () => void }) {
    const members = SAMPLE_MEMBERS;
  const [member, setMember] = useState<Member | null>(null);
  const [memberList, setMemberList] = useState<Member[]>([]);
  const [mood, setMood] = useState(3);
  const [energy, setEnergy] = useState(3);
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);


useEffect(() => {
    async function loadMembers() {
      const res = await fetch("/api/members");
      if (res.ok) {
        const data = await res.json();
        setMemberList(data);
      }
    }
    loadMembers();
  }, []);
const submitCheckIn = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!member) {
      alert("Please select a team member");
      return;
    }

    setLoading(true);
    
    try {
      const response = await fetch("/api/checkins", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          memberId: member.id,  // Changed from 'member' to 'memberId'
          mood, 
          energy, 
          notes 
        })
      });

      if (response.ok) {
        // Success! Clear the form
        setMood(3);
        setEnergy(3);
        setNotes("");
        setMember(null);
        
        if (onSubmitted) onSubmitted();
        
        alert("Check-in submitted successfully!");
      } else {
        const errorData = await response.json();
        alert(`Failed to submit: ${errorData.error || "Unknown error"}`);
      }
    } catch (error) {
      console.error("Error submitting check-in:", error);
      alert("Failed to submit check-in. Please try again.");
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="flex flex-col  relative z-50 ">
        <header className="mb-6">
            <h1 className="text-3xl font-bold text-white">Mood Tracker</h1>
        </header>
        <div className="bg-grey p-4 rounded-xl shadow relative z-30">
            <form onSubmit={submitCheckIn} className="gap-4" style={{ display: "grid"}}>
                <label className="text-white flex flex-col gap-2 ">
                    <p>Team member</p>
                    <MemberSelect members={memberList} selectedMember={member} onChange={(member) => setMember(member || null)} />
                </label>
                <label className="text-white">
                    Mood
                    <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                    {['😢', '😕', '😐', '😊', '😄'].map((emoji, i) => (
                        <button
                        className={`cursor-pointer flex-1 text-4xl p-2 rounded-xl ${mood === i + 1 ? 'border-purple bg-light-purple' : 'border-grey bg-light-grey'}`}
                        key={i}
                        type="button"
                        onClick={() => setMood(i + 1)}
                        >
                        {emoji}
                        </button>
                    ))}
                    </div>
                </label>
                <label className="text-white">
                    Energy
                    <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                    {['😴', '😪', '😑', '💪', '🔥'].map((emoji, i) => (
                        <button
                        className={`cursor-pointer flex-1 text-4xl p-2 rounded-xl ${energy === i + 1 ? 'border-purple bg-light-purple' : 'border-grey bg-light-grey'}`}
                        key={i}
                        type="button"
                        onClick={() => setEnergy(i + 1)}
                        >
                        {emoji}
                        </button>
                    ))}
                    </div>
                </label>
                <label className="text-white flex flex-col gap-2">
                    Notes (optional)
                    <textarea
                    className="bg-light-grey text-white rounded-xl p-2 resize-none"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={4}
                    />
                </label>
                <div className="flex justify-end">
                    <button
                        className={` cursor-pointer ${loading || !member ? 'bg-light-grey' : 'bg-purple'} p-2 text-white rounded-xl`} 
                        type="submit" 
                        disabled={loading || !member}
                    >
                        {loading ? "Saving..." : "Submit check-in"}
                    </button>
                </div>
            </form>
        </div>
    </div>
  );
}
