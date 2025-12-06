import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebaseAdmin";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { uid, name, nim, username } = body as {
      uid?: string;
      name?: string;
      nim?: string;
      username?: string;
    };

    if (!uid || !name || !nim || !username) {
      return NextResponse.json(
        { error: "Field tidak lengkap" },
        { status: 400 }
      );
    }

    await adminDb.collection("users").doc(uid).update({
      name,
      nim,
      username,
    });

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error("Error update-voter:", err);
    return NextResponse.json(
      { error: "Gagal mengupdate pemilih" },
      { status: 500 }
    );
  }
}
