import { redirect } from "next/navigation";

export default function HomePage() {
  // begitu user buka "/", langsung diarahkan ke halaman login
  redirect("/login");
}
