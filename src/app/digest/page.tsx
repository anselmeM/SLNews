import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default function DigestPage() {
  redirect("/home");
}
