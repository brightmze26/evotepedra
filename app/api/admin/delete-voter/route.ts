import { NextRequest, NextResponse } from "next/server";
import { getAdminAuth, getAdminDb } from "@/lib/firebaseAdmin";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { uid } = body as { uid?: string };

    if (!uid) {
      return NextResponse.json(
        { error: "uid pemilih tidak diberikan" },
        { status: 400 }
      );
    }

    const adminAuth = getAdminAuth();
    const adminDb = getAdminDb();

    // 1. Hapus user di Firebase Auth
    await adminAuth.deleteUser(uid);

    // 2. Hapus dokumen user di Firestore
    await adminDb.collection("users").doc(uid).delete();

    // 3. Hapus semua votes milik user ini
    const votesSnap = await adminDb
      .collection("votes")
      .where("voterId", "==", uid)
      .get();

    const batch = adminDb.batch();
    votesSnap.forEach((doc) => batch.delete(doc.ref));
    await batch.commit();

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Error delete-voter:", err);
    return NextResponse.json(
      { error: "Gagal menghapus pemilih" },
      { status: 500 }
    );
  }
}
