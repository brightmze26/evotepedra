"use client";

import { useEffect, useMemo, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { RequireRole } from "@/components/RequireRole";

type Candidate = {
  id: string;
  name: string;
};

type Vote = {
  id: string;
  candidateId: string;
};

export default function ResultsPage() {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [votes, setVotes] = useState<Vote[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const candSnap = await getDocs(collection(db, "candidates"));
      const voteSnap = await getDocs(collection(db, "votes"));

      const candList: Candidate[] = [];
      candSnap.forEach((d) => {
        const data = d.data() as any;
        candList.push({ id: d.id, name: data.name });
      });

      const voteList: Vote[] = [];
      voteSnap.forEach((d) => {
        const data = d.data() as any;
        voteList.push({ id: d.id, candidateId: data.candidateId });
      });

      setCandidates(candList);
      setVotes(voteList);
      setLoading(false);
    };
    load().catch(console.error);
  }, []);

  const tally = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const v of votes) {
      counts[v.candidateId] = (counts[v.candidateId] || 0) + 1;
    }
    return counts;
  }, [votes]);

  const exportCsv = () => {
    const header = "Nama Kandidat,Suara\n";
    const rows = candidates
      .map((c) => `${c.name},${tally[c.id] || 0}`)
      .join("\n");
    const csv = header + rows;
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "hasil-voting.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <RequireRole role="admin">
      <div>
        <h1 className="text-xl font-semibold mb-4">Hasil Voting</h1>
        <p className="text-sm text-slate-700 mb-4">
          Rekapitulasi sederhana perolehan suara untuk setiap kandidat.
        </p>

        {loading ? (
          <p className="text-sm text-slate-600">Memuat data...</p>
        ) : (
          <>
            <div className="bg-white rounded shadow overflow-x-auto mb-4">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="bg-slate-100">
                    <th className="border px-2 py-1 text-left">Nama Kandidat</th>
                    <th className="border px-2 py-1 text-right">Jumlah Suara</th>
                  </tr>
                </thead>
                <tbody>
                  {candidates.map((c) => (
                    <tr key={c.id}>
                      <td className="border px-2 py-1">{c.name}</td>
                      <td className="border px-2 py-1 text-right">
                        {tally[c.id] || 0}
                      </td>
                    </tr>
                  ))}
                  {candidates.length === 0 && (
                    <tr>
                      <td
                        colSpan={2}
                        className="border px-2 py-3 text-center text-slate-500"
                      >
                        Belum ada kandidat.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <button
              onClick={exportCsv}
              className="px-4 py-2 rounded bg-blue-600 text-white text-sm hover:bg-blue-700"
            >
              Download CSV
            </button>
          </>
        )}
      </div>
    </RequireRole>
  );
}
