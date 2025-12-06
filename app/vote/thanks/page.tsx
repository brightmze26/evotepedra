"use client";

import Link from "next/link";
import { LogoutButton } from "@/components/LogoutButton";
import Image from "next/image";

export default function VoteThanksPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-red-900 via-red-700 to-red-500 flex items-center justify-center bg-slate-100">
      <div className="text-white px-8 py-6 max-w-md w-full text-center">
        <h1 className="text-2xl font-bold mb-3">Terima Kasih 🙌</h1>
        <Link href="/login" className="inline-block mt-6 mb-6">
          <Image
            src="/logokpu.png"
            alt="Kembali ke halaman login"
            width={96}
            height={96}
            className="mx-auto rounded-sm shadow-lg hover:scale-105 hover:shadow-xl transition-transform"
          />
        </Link>
        <p className="text-sm -700 mb-4">
          Suara Anda sudah tercatat dalam sistem. Terima kasih atas partisipasi
          Anda dalam pemilihan ketua himpunan.
        </p>
        <div className="flex flex-col gap-2 items-center">
          <div className="w-full max-w-xs mt-2">
            <LogoutButton />
          </div>
        </div>
      </div>
    </main>
  );
}
