import { redirect } from "next/navigation";
import { login } from "../actions";
import {
  isAdminConfigured,
  isAdminRequest,
} from "@/lib/admin/sponsorship-auth";

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  if (await isAdminRequest()) redirect("/admin/sponsorships");
  const { error } = await searchParams;
  const configured = isAdminConfigured();

  return (
    <main className="mx-auto max-w-md space-y-4">
      <h1 className="text-xl font-bold">Sponsorship console</h1>
      {!configured ? (
        <p className="rounded-xl bg-red-50 p-3 text-red-800">
          SPONSORSHIP_ADMIN_KEY is not configured for this deployment. Add it in
          Vercel and redeploy.
        </p>
      ) : (
        <form
          action={login}
          className="space-y-3 rounded-2xl border border-outline-variant/30 p-4"
        >
          <label className="block text-xs font-semibold" htmlFor="key">
            Admin key
          </label>
          <input
            id="key"
            name="key"
            type="password"
            autoComplete="off"
            className="w-full rounded-lg border border-outline-variant/40 px-3 py-2"
            required
          />
          {error ? (
            <p className="text-xs text-red-700">That key was not accepted.</p>
          ) : null}
          <button
            type="submit"
            className="rounded-lg bg-black px-4 py-2 text-white"
          >
            Sign in
          </button>
        </form>
      )}
    </main>
  );
}
