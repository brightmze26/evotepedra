import { NextRequest, NextResponse } from "next/server";
import { adminAuth, adminDb } from "@/lib/firebaseAdmin";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { uid } = body as { uid?: string };

    if (!uid) {
      return NextResponse.json(
        { error: "uid wajib diisi" },
        { status: 400 }
      );
    }

    // 1) Hapus semua vote milik pemilih ini
    const votesSnap = await adminDb
      .collection("votes")
      .where("voterId", "==", uid)
      .get();

    if (!votesSnap.empty) {
      const batch = adminDb.batch();
      votesSnap.forEach((docSnap) => {
        batch.delete(docSnap.ref);
      });
      await batch.commit();
    }

    // 2) Hapus dokumen user di Firestore
    await adminDb.collection("users").doc(uid).delete();

    // 3) Hapus user di Firebase Auth
    await adminAuth.deleteUser(uid);

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error("Error delete-voter:", err);
    return NextResponse.json(
      { error: "Gagal menghapus pemilih" },
      { status: 500 }
    );
  }
}
