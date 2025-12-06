"use client";

import { RequireRole } from "@/components/RequireRole";
import { useAuth } from "@/context/AuthContext";

export default function AdminHome() {
  const { appUser } = useAuth();
  return (
    <RequireRole role="admin">
      <div>
        <h1 className="text-2xl font-bold mb-2">Dashboard Admin</h1>
        <p className="text-sm text-slate-700 mb-4">
          Selamat datang, {appUser?.name}. Dari panel ini Anda dapat
          mengelola daftar pemilih, kandidat, dan melihat hasil voting.
        </p>
        <ul className="list-disc list-inside text-sm text-slate-700 space-y-1">
          <li>Menu <strong>Pemilih</strong> untuk mengelola akun login pemilih.</li>
          <li>Menu <strong>Kandidat</strong> untuk mengatur data calon ketua himpunan.</li>
          <li>Menu <strong>Hasil Voting</strong> untuk memantau perolehan suara.</li>
        </ul>
      </div>
    </RequireRole>
  );
}
