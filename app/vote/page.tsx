"use client";

import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { RequireRole } from "@/components/RequireRole";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";
import Image from "next/image";

type Candidate = {
  id: string;
  name: string;
  nim: string;
  visi: string;
  misi: string;
  programUnggulan: string;
  photoUrl?: string;
};

export default function VoteGalleryPage() {
  const { appUser } = useAuth();
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const snap = await getDocs(collection(db, "candidates"));
      const list: Candidate[] = [];
      snap.forEach((d) => {
        list.push({ id: d.id, ...(d.data() as any) });
      });
      setCandidates(list);
      setLoading(false);
    };
    load().catch((err) => {
      console.error(err);
      setLoading(false);
    });
  }, []);

  // kalau belum ada user, biarkan RequireRole yang handle
  if (!appUser) {
    return (
      <RequireRole role="voter">
        <div />
      </RequireRole>
    );
  }

  // kalau sudah vote, beri info elegan + logo KPU yang bisa diklik
  if (appUser.hasVoted) {
    return (
      <RequireRole role="voter">
        <main className="min-h-screen bg-gradient-to-br from-red-900 via-red-700 to-red-500 flex items-center justify-center px-4">
          <div className="bg-black/40 backdrop-blur-md rounded-2xl shadow-2xl px-8 py-10 max-w-lg w-full text-center text-white border border-white/10">
            <h1 className="text-3xl font-semibold mb-3 tracking-tight">
              Terima Kasih 🙌
            </h1>
            <p className="text-sm text-red-100 mb-4">
              Sistem mencatat bahwa Anda sudah melakukan voting.{" "}
              Suara Anda sangat berarti dalam pemilihan ketua himpunan.
            </p>
            <p className="text-xs text-red-200">
              Jika Anda merasa ini sebuah kesalahan, silakan hubungi admin
              panitia pemilihan.
            </p>

            {/* Logo KPU yang bisa diklik untuk kembali ke login */}
            <Link href="/login" className="inline-block mt-6">
              <Image
                src="/logokpu.png"
                alt="Kembali ke halaman login"
                width={96}
                height={96}
                className="mx-auto rounded-full shadow-lg hover:scale-105 hover:shadow-xl transition-transform"
              />
            </Link>
          </div>
        </main>
      </RequireRole>
    );
  }

  return (
    <RequireRole role="voter">
      <main className="min-h-screen bg-gradient-to-br from-red-900 via-red-700 to-red-500 text-white px-4 py-8">
        {/* max-w untuk nge-center seluruh konten di tengah layar */}
        <section className="max-w-5xl mx-auto">
          {/* HEADER TENGAH */}
          <header className="mb-10 pt-4">
            <div className="text-center max-w-xl mx-auto">
              <p className="text-[11px] uppercase tracking-[0.25em] text-red-200 mb-2">
                Pemilihan Ketua Himpunan
              </p>
              <h1 className="text-3xl md:text-4xl font-semibold tracking-tight">
                Tentukan Pilihan Anda
              </h1>
              <p className="mt-3 text-sm text-red-100 italic">
                Silakan klik foto calon ketua himpunan untuk melihat profil
                lengkap sebelum Anda menentukan pilihan.
              </p>
            </div>
          </header>

          {/* GRID KANDIDAT */}
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="w-10 h-10 border-2 border-red-200/50 border-t-white rounded-full animate-spin" />
            </div>
          ) : candidates.length === 0 ? (
            <p className="text-center text-red-100">
              Belum ada kandidat yang tersedia.
            </p>
          ) : (
            // grid + place-items-center supaya kartu benar-benar di tengah
            <div className="grid gap-8 sm:grid-cols-2 justify-center place-items-center">
              {candidates.map((c) => (
                <Link
                  key={c.id}
                  href={`/vote/${c.id}`}
                  className="group relative w-full max-w-sm rounded-3xl overflow-hidden shadow-2xl bg-black/30 border border-white/10 hover:border-white/40 transition transform hover:-translate-y-1 hover:shadow-[0_24px_60px_rgba(0,0,0,0.5)]"
                >
                  <div className="aspect-[4/5] overflow-hidden">
                    {c.photoUrl ? (
                      <img
                        src={c.photoUrl}
                        alt={c.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-red-800 to-red-500">
                        <span className="text-3xl font-semibold">
                          {c.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")
                            .slice(0, 2)
                            .toUpperCase()}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* overlay gelap di bawah untuk teks */}
                  <div className="absolute inset-x-0 bottom-0 pt-16 pb-4 px-4 bg-gradient-to-t from-black/85 via-black/40 to-transparent">
                    <div className="text-base font-semibold text-white drop-shadow">
                      {c.name}
                    </div>
                    <div className="text-[11px] text-red-50/90 mt-0.5">
                      NIM {c.nim}
                    </div>
                    <div className="text-[11px] text-red-50/80 mt-2 line-clamp-2">
                      “{c.visi}”
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>
      </main>
    </RequireRole>
  );
}
