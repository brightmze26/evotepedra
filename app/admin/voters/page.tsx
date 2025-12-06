"use client";

import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { RequireRole } from "@/components/RequireRole";

type Voter = {
  id: string;      // ini = uid user (doc id di Firestore)
  name: string;
  nim: string;
  username: string;
};

export default function VotersPage() {
  const [voters, setVoters] = useState<Voter[]>([]);

  // state tambah pemilih
  const [name, setName] = useState("");
  const [nim, setNim] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");

  // state edit pemilih
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editNim, setEditNim] = useState("");
  const [editUsername, setEditUsername] = useState("");
  const [savingEdit, setSavingEdit] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const loadVoters = async () => {
    const snap = await getDocs(collection(db, "users"));
    const list: Voter[] = [];
    snap.forEach((docSnap) => {
      const data = docSnap.data() as any;
      if (data.role === "voter") {
        list.push({
          id: docSnap.id, // uid
          name: data.name,
          nim: data.nim,
          username: data.username,
        });
      }
    });
    setVoters(list);
  };

  useEffect(() => {
    loadVoters().catch(console.error);
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setCreating(true);
    try {
      const res = await fetch("/api/admin/create-voter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, nim, username, password }),
      });
      if (!res.ok) {
        const text = await res.text();
        console.error(text);
        setError("Gagal membuat pemilih. Cek log server.");
      } else {
        setName("");
        setNim("");
        setUsername("");
        setPassword("");
        await loadVoters();
      }
    } catch (err) {
      console.error(err);
      setError("Terjadi kesalahan jaringan.");
    } finally {
      setCreating(false);
    }
  };

  const startEdit = (v: Voter) => {
    setEditingId(v.id);
    setEditName(v.name);
    setEditNim(v.nim);
    setEditUsername(v.username);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditName("");
    setEditNim("");
    setEditUsername("");
  };

  const handleEditSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingId) return;
    setSavingEdit(true);
    try {
      const res = await fetch("/api/admin/update-voter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          uid: editingId,
          name: editName,
          nim: editNim,
          username: editUsername,
        }),
      });
      if (!res.ok) {
        const text = await res.text();
        console.error(text);
        alert("Gagal mengupdate pemilih. Cek log server.");
      } else {
        await loadVoters();
        cancelEdit();
      }
    } catch (err) {
      console.error(err);
      alert("Terjadi kesalahan jaringan.");
    } finally {
      setSavingEdit(false);
    }
  };

  const handleDelete = async (uid: string) => {
    if (!confirm("Yakin ingin menghapus pemilih ini?")) return;
    setDeletingId(uid);
    try {
      const res = await fetch("/api/admin/delete-voter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ uid }),
      });
      if (!res.ok) {
        const text = await res.text();
        console.error(text);
        alert("Gagal menghapus pemilih. Cek log server.");
      } else {
        await loadVoters();
      }
    } catch (err) {
      console.error(err);
      alert("Terjadi kesalahan jaringan.");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <RequireRole role="admin">
      <div>
        <h1 className="text-xl font-semibold mb-4">Daftar Pemilih</h1>

        {/* Form tambah pemilih */}
        <form
          onSubmit={handleAdd}
          className="mb-6 grid gap-2 max-w-md bg-white p-4 rounded shadow"
        >
          <h2 className="text-sm font-semibold mb-1">Tambah Pemilih Baru</h2>
          <input
            placeholder="Nama"
            className="border rounded px-3 py-2 text-sm"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <input
            placeholder="NPM"
            className="border rounded px-3 py-2 text-sm"
            value={nim}
            onChange={(e) => setNim(e.target.value)}
            required
          />
          <input
            placeholder="Username (untuk login)"
            className="border rounded px-3 py-2 text-sm"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
          <input
            placeholder="Password"
            type="password"
            className="border rounded px-3 py-2 text-sm"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          {error && <p className="text-xs text-red-500">{error}</p>}
          <button
            type="submit"
            disabled={creating}
            className="mt-1 px-4 py-2 bg-green-600 text-white rounded text-sm disabled:bg-slate-400"
          >
            {creating ? "Menyimpan..." : "Tambah Pemilih"}
          </button>
          <p className="text-[11px] text-slate-500 mt-1">
            Akun login akan dibuat dengan email: <code>username@evote.local</code>.
          </p>
        </form>

        {/* Form edit pemilih */}
        {editingId && (
          <form
            onSubmit={handleEditSave}
            className="mb-6 grid gap-2 max-w-md bg-white p-4 rounded shadow border border-blue-300"
          >
            <h2 className="text-sm font-semibold mb-1 text-blue-700">
              Edit Pemilih
            </h2>
            <input
              placeholder="Nama"
              className="border rounded px-3 py-2 text-sm"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              required
            />
            <input
              placeholder="NPM"
              className="border rounded px-3 py-2 text-sm"
              value={editNim}
              onChange={(e) => setEditNim(e.target.value)}
              required
            />
            <input
              placeholder="Username"
              className="border rounded px-3 py-2 text-sm"
              value={editUsername}
              onChange={(e) => setEditUsername(e.target.value)}
              required
            />
            <div className="flex gap-2 mt-2">
              <button
                type="submit"
                disabled={savingEdit}
                className="px-4 py-2 bg-blue-600 text-white rounded text-sm disabled:bg-slate-400"
              >
                {savingEdit ? "Menyimpan..." : "Simpan Perubahan"}
              </button>
              <button
                type="button"
                onClick={cancelEdit}
                className="px-4 py-2 bg-slate-200 text-slate-800 rounded text-sm"
              >
                Batal
              </button>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Perubahan username hanya mengubah data di Firestore.  
              Login tetap memakai username yang sama + password yang sudah dibuat.  
              Untuk ganti email/password di Auth, sebaiknya hapus lalu buat ulang.
            </p>
          </form>
        )}

        {/* Tabel pemilih */}
        <div className="bg-white rounded shadow overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-slate-100">
                <th className="border px-2 py-1 text-left">Nama</th>
                <th className="border px-2 py-1 text-left">NPM</th>
                <th className="border px-2 py-1 text-left">Username</th>
                <th className="border px-2 py-1 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {voters.map((v) => (
                <tr key={v.id}>
                  <td className="border px-2 py-1">{v.name}</td>
                  <td className="border px-2 py-1">{v.nim}</td>
                  <td className="border px-2 py-1">{v.username}</td>
                  <td className="border px-2 py-1 text-center">
                    <div className="flex gap-2 justify-center">
                      <button
                        type="button"
                        onClick={() => startEdit(v)}
                        className="px-2 py-1 text-xs rounded bg-yellow-400 text-slate-900 hover:bg-yellow-500"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(v.id)}
                        disabled={deletingId === v.id}
                        className="px-2 py-1 text-xs rounded bg-red-600 text-white hover:bg-red-700 disabled:bg-slate-500"
                      >
                        {deletingId === v.id ? "Menghapus..." : "Hapus"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {voters.length === 0 && (
                <tr>
                  <td
                    colSpan={4}
                    className="border px-2 py-3 text-center text-slate-500"
                  >
                    Belum ada data pemilih.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </RequireRole>
  );
}
