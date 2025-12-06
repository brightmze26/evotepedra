"use client";

import { useEffect, useState } from "react";
import {
  collection,
  addDoc,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { RequireRole } from "@/components/RequireRole";

type Candidate = {
  id: string;
  name: string;
  nim: string;
  visi: string;
  misi: string;
  programUnggulan: string;
  photoUrl?: string;
};

export default function CandidatesPage() {
  const [candidates, setCandidates] = useState<Candidate[]>([]);

  // STATE TAMBAH KANDIDAT
  const [name, setName] = useState("");
  const [nim, setNim] = useState("");
  const [visi, setVisi] = useState("");
  const [misi, setMisi] = useState("");
  const [programUnggulan, setProgramUnggulan] = useState("");
  const [photoUrl, setPhotoUrl] = useState("");
  const [saving, setSaving] = useState(false);

  // STATE EDIT KANDIDAT
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editNim, setEditNim] = useState("");
  const [editVisi, setEditVisi] = useState("");
  const [editMisi, setEditMisi] = useState("");
  const [editProgramUnggulan, setEditProgramUnggulan] = useState("");
  const [editPhotoUrl, setEditPhotoUrl] = useState("");
  const [savingEdit, setSavingEdit] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const loadCandidates = async () => {
    const snap = await getDocs(collection(db, "candidates"));
    const list: Candidate[] = [];
    snap.forEach((docSnap) => {
      list.push({ id: docSnap.id, ...(docSnap.data() as any) });
    });
    setCandidates(list);
  };

  useEffect(() => {
    loadCandidates().catch(console.error);
  }, []);

  const resetAddForm = () => {
    setName("");
    setNim("");
    setVisi("");
    setMisi("");
    setProgramUnggulan("");
    setPhotoUrl("");
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await addDoc(collection(db, "candidates"), {
        name,
        nim,
        visi,
        misi,
        programUnggulan,
        photoUrl: photoUrl || null,
      });
      resetAddForm();
      await loadCandidates();
    } finally {
      setSaving(false);
    }
  };

  const startEdit = (c: Candidate) => {
    setEditingId(c.id);
    setEditName(c.name);
    setEditNim(c.nim);
    setEditVisi(c.visi);
    setEditMisi(c.misi);
    setEditProgramUnggulan(c.programUnggulan);
    setEditPhotoUrl(c.photoUrl || "");
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditName("");
    setEditNim("");
    setEditVisi("");
    setEditMisi("");
    setEditProgramUnggulan("");
    setEditPhotoUrl("");
  };

  const handleEditSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingId) return;
    setSavingEdit(true);
    try {
      await updateDoc(doc(db, "candidates", editingId), {
        name: editName,
        nim: editNim,
        visi: editVisi,
        misi: editMisi,
        programUnggulan: editProgramUnggulan,
        photoUrl: editPhotoUrl || null,
      });
      await loadCandidates();
      cancelEdit();
    } finally {
      setSavingEdit(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Yakin ingin menghapus kandidat ini?")) return;
    setDeletingId(id);
    try {
      await deleteDoc(doc(db, "candidates", id));
      await loadCandidates();
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <RequireRole role="admin">
      <div>
        <h1 className="text-xl font-semibold mb-4">Daftar Kandidat</h1>

        {/* FORM TAMBAH KANDIDAT */}
        <form
          onSubmit={handleAdd}
          className="mb-6 grid gap-2 max-w-xl bg-white p-4 rounded shadow"
        >
          <h2 className="text-sm font-semibold mb-1">Tambah Kandidat</h2>
          <input
            placeholder="Nama"
            className="border rounded px-3 py-2 text-sm"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <input
            placeholder="NIM"
            className="border rounded px-3 py-2 text-sm"
            value={nim}
            onChange={(e) => setNim(e.target.value)}
            required
          />
          <textarea
            placeholder="Visi"
            className="border rounded px-3 py-2 text-sm"
            value={visi}
            onChange={(e) => setVisi(e.target.value)}
            required
          />
          <textarea
            placeholder="Misi"
            className="border rounded px-3 py-2 text-sm"
            value={misi}
            onChange={(e) => setMisi(e.target.value)}
            required
          />
          <textarea
            placeholder="Program Unggulan"
            className="border rounded px-3 py-2 text-sm"
            value={programUnggulan}
            onChange={(e) => setProgramUnggulan(e.target.value)}
            required
          />

          <input
            placeholder="URL foto kandidat (opsional)"
            className="border rounded px-3 py-2 text-xs"
            value={photoUrl}
            onChange={(e) => setPhotoUrl(e.target.value)}
          />
          <p className="text-[11px] text-slate-500">
            Upload foto di layanan lain (misalnya GitHub, Imgur, dsb) lalu tempel
            URL-nya di sini.
          </p>

          <button
            type="submit"
            disabled={saving}
            className="mt-2 px-4 py-2 bg-green-600 text-white rounded text-sm disabled:bg-slate-400"
          >
            {saving ? "Menyimpan..." : "Tambah Kandidat"}
          </button>
        </form>

        {/* FORM EDIT KANDIDAT */}
        {editingId && (
          <form
            onSubmit={handleEditSave}
            className="mb-6 grid gap-2 max-w-xl bg-white p-4 rounded shadow border border-blue-300"
          >
            <h2 className="text-sm font-semibold mb-1 text-blue-700">
              Edit Kandidat
            </h2>
            <input
              placeholder="Nama"
              className="border rounded px-3 py-2 text-sm"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              required
            />
            <input
              placeholder="NIM"
              className="border rounded px-3 py-2 text-sm"
              value={editNim}
              onChange={(e) => setEditNim(e.target.value)}
              required
            />
            <textarea
              placeholder="Visi"
              className="border rounded px-3 py-2 text-sm"
              value={editVisi}
              onChange={(e) => setEditVisi(e.target.value)}
              required
            />
            <textarea
              placeholder="Misi"
              className="border rounded px-3 py-2 text-sm"
              value={editMisi}
              onChange={(e) => setEditMisi(e.target.value)}
              required
            />
            <textarea
              placeholder="Program Unggulan"
              className="border rounded px-3 py-2 text-sm"
              value={editProgramUnggulan}
              onChange={(e) => setEditProgramUnggulan(e.target.value)}
              required
            />
            <input
              placeholder="URL foto kandidat (opsional)"
              className="border rounded px-3 py-2 text-xs"
              value={editPhotoUrl}
              onChange={(e) => setEditPhotoUrl(e.target.value)}
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
          </form>
        )}

        {/* LIST KANDIDAT */}
        <div className="grid md:grid-cols-2 gap-4">
          {candidates.map((c) => (
            <div
              key={c.id}
              className="bg-white rounded shadow p-4 flex gap-3 items-start"
            >
              {c.photoUrl && (
                <img
                  src={c.photoUrl}
                  alt={c.name}
                  className="w-16 h-16 rounded-full object-cover"
                />
              )}
              <div className="flex-1">
                <div className="font-semibold text-sm">
                  {c.name} ({c.nim})
                </div>
                <div className="text-xs mt-1">
                  <strong>Visi:</strong> {c.visi}
                </div>
                <div className="text-xs mt-1">
                  <strong>Misi:</strong> {c.misi}
                </div>
                <div className="text-xs mt-1">
                  <strong>Program Unggulan:</strong> {c.programUnggulan}
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <button
                  type="button"
                  onClick={() => startEdit(c)}
                  className="px-3 py-1 text-xs rounded bg-yellow-400 text-slate-900 hover:bg-yellow-500"
                >
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(c.id)}
                  disabled={deletingId === c.id}
                  className="px-3 py-1 text-xs rounded bg-red-600 text-white hover:bg-red-700 disabled:bg-slate-500"
                >
                  {deletingId === c.id ? "Menghapus..." : "Hapus"}
                </button>
              </div>
            </div>
          ))}
          {candidates.length === 0 && (
            <p className="text-sm text-slate-500">
              Belum ada kandidat yang ditambahkan.
            </p>
          )}
        </div>
      </div>
    </RequireRole>
  );
}
