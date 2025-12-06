"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export function RequireRole({
  children,
  role,
}: {
  children: React.ReactNode;
  role: "admin" | "voter";
}) {
  const { appUser, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!appUser) {
        router.push("/login");
      } else if (appUser.role !== role) {
        router.push("/");
      }
    }
  }, [appUser, loading, router, role]);

  if (loading || !appUser) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-sm text-slate-600">Loading...</p>
      </div>
    );
  }

  return <>{children}</>;
}
