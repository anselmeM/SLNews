import { redirect } from "next/navigation";
import { CampaignForm } from "./campaign-form";
import { isAdminRequest } from "@/lib/admin/sponsorship-auth";

export default async function NewCampaignPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  if (!(await isAdminRequest())) redirect("/admin/sponsorships/login");
  const { error } = await searchParams;
  return (
    <main className="space-y-4">
      <h1 className="text-xl font-bold">New campaign</h1>
      {error ? (
        <p className="rounded-lg bg-red-50 p-3 text-red-800">{error}</p>
      ) : null}
      <CampaignForm />
    </main>
  );
}
