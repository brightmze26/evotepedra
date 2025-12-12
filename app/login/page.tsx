"use client";

import { FormEvent, useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import { doc, getDoc } from "firebase/firestore";
import { motion } from "framer-motion";
import Image from "next/image";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loadingLogin, setLoadingLogin] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setLoadingLogin(true);
    try {
      const email = `${username}@evote.local`;
      const cred = await signInWithEmailAndPassword(auth, email, password);
      const snap = await getDoc(doc(db, "users", cred.user.uid));
      const data = snap.data();
      if (data?.role === "admin") router.push("/admin");
      else router.push("/vote");
    } catch (err) {
      console.error(err);
      setError("Login gagal. Periksa username / password.");
    } finally {
      setLoadingLogin(false);
    }
  };

  return (
    <main className="relative min-h-screen w-full overflow-hidden bg-gradient-to-br from-red-900 via-red-700 to-red-500 flex items-center justify-center px-4">
      {/* dekorasi blur tapi tidak keluar layar karena overflow-hidden */}
      <div className="pointer-events-none absolute -top-24 -left-10 w-60 h-60 rounded-full bg-red-300/25 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 right-[-3rem] w-72 h-72 rounded-full bg-red-950/40 blur-3xl" />

      <div className="relative z-10 max-w-5xl w-full mx-auto grid gap-8 md:gap-10 md:grid-cols-[1.1fr,0.9fr] items-center py-10 md:py-0">
        {/* PANEL INFO + LOGO */}
        <motion.section
          initial={{ opacity: 0, x: -25 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="text-white"
        >
          <div className="flex items-center gap-4 mb-6">
            <motion.div
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 230, damping: 16 }}
              className="rounded-full  p-1 shadow-lg"
            >
              <Image
                src="/logopedra.png"
                alt="Logo HIMA Geofisika PEDRA"
                width={60}
                height={60}
                className="w-12 h-12 sm:w-14 sm:h-14 rounded-full"
              />
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 230, damping: 16 }}
              className="rounded-full p-1 shadow-lg"
            >
              <Image
                src="/logokpu.png"
                alt="Logo KPU"
                width={60}
                height={60}
                className="w-12 h-12 sm:w-14 sm:h-14 rounded-full"
              />
            </motion.div>
          </div>

          <h1 className="text-3xl md:text-4xl font-semibold tracking-tight mb-3">
            Pemilihan Ketua Himpunan Geofisika &quot;PEDRA&quot;
          </h1>
          <p className="text-sm md:text-base text-red-100 max-w-md italic">
            Silakan masuk menggunakan akun yang telah diberikan oleh panitia.
            Hak suara Anda hanya dapat digunakan satu kali dan akan tercatat di
            sistem secara aman.
          </p>

          <p className="mt-6 text-[11px] text-red-200 uppercase tracking-[0.25em]">
            Sistem E-Vote • Geofisika | Universitas Padjadjaran
          </p>
        </motion.section>

        {/* PANEL LOGIN */}
        <motion.form
          onSubmit={handleSubmit}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut", delay: 0.1 }}
          className="bg-white/95 backdrop-blur-md shadow-2xl rounded-2xl px-7 py-7 md:px-8 md:py-8 w-full max-w-md mx-auto border border-red-900/20"
        >
          {/* <motion.h2
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-xl font-semibold mb-1 text-center text-red-900"
          >
            Login Pemilih
          </motion.h2>
          <p className="text-[11px] text-center text-gray-500 mb-6">
            Masukkan <span className="font-medium">username</span> dan{" "}
            <span className="font-medium">password</span> yang telah dibagikan
            oleh panitia.
          </p>

          <label className="block mb-4 text-sm font-medium text-gray-700">
            Username
            <input
              className="mt-1 w-full border border-red-900/30 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-800/70 focus:border-transparent"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              placeholder="Masukkan username"
            />
          </label>

          <label className="block mb-4 text-sm font-medium text-gray-700">
            Password
            <input
              type="password"
              className="mt-1 w-full border border-red-900/30 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-800/70 focus:border-transparent"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Masukkan password"
            />
          </label>

          {error && (
            <p className="text-red-600 text-xs mb-3 text-center">{error}</p>
          )}

          <motion.button
            whileTap={{ scale: 0.97 }}
            type="submit"
            disabled={loadingLogin}
            className="w-full py-2.5 text-sm font-semibold bg-red-900 text-white rounded-lg hover:bg-red-800 transition disabled:bg-gray-400"
          >
            {loadingLogin ? "Memproses..." : "Login"}
          </motion.button> */}

          <p className="mt-4 text-[15px] text-gray-500 text-center italic">
            Sistem mencatat bahwa waktu pemilihan telah berakhir. Terima kasih atas partisipasi anda dalam pemilihan Calon Ketua Himpunan Mahasiswa Geofisika "PEDRA".
          </p>
          <p className="mt-4 text-[15px] text-gray-500 text-center italic">
            © 2025 KPU PEDRA. All Rights Reserved
          </p>
        </motion.form>
      </div>
    </main>
  );
}
