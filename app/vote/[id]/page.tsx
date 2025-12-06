"use client";

import { useEffect, useState } from "react";
import {
  collection,
  addDoc,
  getDoc,
  getDocs,
  doc,
  updateDoc,
  query,
  where,
  limit,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { RequireRole } from "@/components/RequireRole";
import { useAuth } from "@/context/AuthContext";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

type Candidate = {
  id: string;
  name: string;
  nim: string;
  visi: string;
  misi: string;
  programUnggulan: string;
  photoUrl?: string;
};

export default function VoteDetailPage() {
  const { appUser } = useAuth();
  const params = useParams<{ id: string }>();
  const router = useRouter();

  const [candidate, setCandidate] = useState<Candidate | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState("");

  const candidateId = params?.id;

  useEffect(() => {
    const load = async () => {
      if (!candidateId) return;
      try {
        const snap = await getDoc(doc(db, "candidates", candidateId));
        if (snap.exists()) {
          setCandidate({ id: snap.id, ...(snap.data() as any) });
        } else {
          setCandidate(null);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [candidateId]);

  const handleVote = async () => {
    if (!appUser || !candidate) return;

    if (appUser.hasVoted) {
      setStatus("Anda sudah melakukan voting sebelumnya. Terima kasih.");
      return;
    }

    const yakin = window.confirm(
      `Apakah Anda yakin memilih ${candidate.name} sebagai calon ketua himpunan? Pilihan ini tidak dapat diubah.`
    );
    if (!yakin) {
      setStatus(
        "Pemilihan dibatalkan. Silakan pastikan pilihan Anda sebelum melanjutkan."
      );
      return;
    }

    setSubmitting(true);
    setStatus("Memeriksa status voting Anda...");

    try {
      // Cek apakah sudah pernah vote
      const votesRef = collection(db, "votes");
      const q = query(votesRef, where("voterId", "==", appUser.uid), limit(1));
      const existingSnap = await getDocs(q);

      if (!existingSnap.empty) {
        setStatus("Anda sudah pernah melakukan voting. Terima kasih.");
        setSubmitting(false);
        return;
      }

      setStatus("Menyimpan suara Anda...");

      // Simpan vote
      await addDoc(collection(db, "votes"), {
        voterId: appUser.uid,
        candidateId: candidate.id,
        createdAt: new Date(),
      });

      // Update flag hasVoted di users
      await updateDoc(doc(db, "users", appUser.uid), {
        hasVoted: true,
      });

      router.push("/vote/thanks");
    } catch (err) {
      console.error(err);
      setStatus("Terjadi kesalahan saat menyimpan suara.");
      setSubmitting(false);
    }
  };

  // Belum login → biarkan RequireRole yang handle
  if (!appUser) {
    return (
      <RequireRole role="voter">
        <div />
      </RequireRole>
    );
  }

  // Sudah vote → langsung info saja
  if (appUser.hasVoted) {
    return (
      <RequireRole role="voter">
        <main className="min-h-screen bg-gradient-to-br from-red-900 via-red-700 to-red-500 flex items-center justify-center px-4">
          <div className="bg-black/40 backdrop-blur-md rounded-2xl shadow-2xl px-8 py-10 max-w-lg w-full text-center text-white border border-white/10">
            <h1 className="text-3xl font-semibold mb-3 tracking-tight">
              Anda Sudah Voting
            </h1>
            <p className="text-sm text-red-100 mb-4">
              Sistem mencatat bahwa Anda sudah memberikan suara. Anda tidak
              dapat memilih ulang kandidat lain.
            </p>
            <Link
              href="/vote"
              className="inline-flex items-center justify-center mt-2 px-4 py-2 rounded-full text-sm bg-white/10 hover:bg-white/20 border border-white/30 transition"
            >
              Kembali ke daftar kandidat
            </Link>
          </div>
        </main>
      </RequireRole>
    );
  }

  return (
    <RequireRole role="voter">
      <main className="min-h-screen bg-gradient-to-br from-red-900 via-red-700 to-red-500 text-white px-4 py-10">
        <section className="max-w-5xl mx-auto">
          {/* Header atas + tombol kembali */}
          <div className="mb-6 flex items-center justify-between gap-4">
            <div>
              <p className="text-[11px] uppercase tracking-[0.25em] text-red-200">
                Pemilihan Ketua Himpunan
              </p>
              <h1 className="text-2xl md:text-3xl font-semibold tracking-tight mt-1">
                Konfirmasi Pilihan Anda
              </h1>
            </div>
            <Link
              href="/vote"
              className="text-xs px-3 py-1 rounded-full border text-black border-white/40 bg-white/10 hover:bg-white/20 transition"
            >
              ← Kembali ke daftar
            </Link>
          </div>

          {loading ? (
            <div className="flex justify-center py-16">
              <div className="w-10 h-10 border-2 border-red-200/50 border-t-white rounded-full animate-spin" />
            </div>
          ) : !candidate ? (
            <div className="bg-black/40 backdrop-blur-md rounded-2xl shadow-2xl px-8 py-10 text-center border border-white/10">
              <p className="text-sm text-red-100">
                Kandidat tidak ditemukan. Mungkin sudah dihapus oleh admin.
              </p>
              <Link
                href="/vote"
                className="inline-flex items-center justify-center mt-4 px-4 py-2 rounded-full text-sm bg-white/10 hover:bg-white/20 border border-white/30 transition"
              >
                Kembali ke daftar kandidat
              </Link>
            </div>
          ) : (
            <div className="bg-black/30 backdrop-blur-lg rounded-3xl shadow-2xl border border-white/10 px-6 py-6 md:px-10 md:py-8">
              {/* Layout dua kolom: foto + detail */}
              <div className="grid gap-8 md:grid-cols-[260px,1fr] items-start">
                {/* FOTO KANDIDAT */}
                <div className="flex items-start justify-center md:justify-start">
                  <div className="relative w-48 md:w-56 aspect-[3/4]">
                    <div className="absolute -inset-1 rounded-3xl bg-gradient-to-br from-red-100/80 via-white/50 to-red-700/90 opacity-70 blur-lg" />
                    <div className="relative w-full h-full rounded-3xl overflow-hidden border border-white/10 shadow-xl">
                      {candidate.photoUrl ? (
                        <img
                          src={candidate.photoUrl}
                          alt={candidate.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-red-800 to-red-500">
                          <span className="text-4xl font-semibold">
                            {candidate.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")
                              .slice(0, 2)
                              .toUpperCase()}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* DETAIL TEKS */}
                <div className="space-y-4 text-sm leading-relaxed">
                  <div>
                    <h2 className="text-2xl md:text-3xl font-semibold tracking-tight">
                      {candidate.name}
                    </h2>
                    <p className="text-sm text-red-100 mt-1 font-medium">
                      {candidate.nim}
                    </p>
                  </div>

                  <div className="h-px w-20 bg-red-300/60" />

                  <div className="space-y-3">
                    <div>
                      <h3 className="text-xs font-semibold uppercase tracking-[0.3em] text-red-200">
                        Visi
                      </h3>
                      <p className="mt-1 text-sm text-red-50">
                        {candidate.visi}
                      </p>
                    </div>

                    <div>
                      <h3 className="text-xs font-semibold uppercase tracking-[0.3em] text-red-200">
                        Misi
                      </h3>
                      <p className="mt-1 text-sm text-red-50 whitespace-pre-line">
                        {candidate.misi}
                      </p>
                    </div>

                    <div>
                      <h3 className="text-xs font-semibold uppercase tracking-[0.3em] text-red-200">
                        Program Unggulan
                      </h3>
                      <p className="mt-1 text-sm text-red-50 whitespace-pre-line">
                        {candidate.programUnggulan}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bagian bawah: catatan & tombol vote */}
              <div className="mt-8 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                <p className="text-[11px] text-red-200 max-w-xl">
                  Setelah Anda menekan tombol <strong>Vote</strong>, pilihan
                  tidak dapat diubah. Pastikan Anda sudah mempertimbangkan visi,
                  misi, dan program unggulan kandidat ini.
                </p>
                <button
                  onClick={handleVote}
                  disabled={submitting}
                  className="inline-flex items-center justify-center px-6 py-2 rounded-full bg-white text-red-700 text-sm font-semibold shadow-lg hover:shadow-xl hover:bg-red-50 disabled:bg-red-200 disabled:text-red-500 transition"
                >
                  {submitting ? "Memproses..." : "Vote Kandidat Ini"}
                </button>
              </div>

              {status && (
                <p className="mt-3 text-[11px] text-red-100">{status}</p>
              )}
            </div>
          )}
        </section>
      </main>
    </RequireRole>
  );
}
