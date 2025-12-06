import { NextRequest, NextResponse } from "next/server";
import { adminAuth, adminDb } from "@/lib/firebaseAdmin";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, nim, username, password } = body as {
      name?: string;
      nim?: string;
      username?: string;
      password?: string;
    };

    if (!name || !nim || !username || !password) {
      return NextResponse.json(
        { error: "Field tidak lengkap" },
        { status: 400 }
      );
    }

    const email = `${username}@evote.local`;

    const userRecord = await adminAuth.createUser({
      email,
      password,
      displayName: name,
    });

    await adminDb.collection("users").doc(userRecord.uid).set({
      uid: userRecord.uid,
      name,
      nim,
      username,
      role: "voter",
      hasVoted: false,
    });

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error("Error create-voter:", err);
    return NextResponse.json(
      { error: "Gagal membuat pemilih" },
      { status: 500 }
    );
  }
}
