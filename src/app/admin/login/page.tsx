"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export default function AdminLoginPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const email = String(form.get("email"));
    const password = String(form.get("password"));
    setLoading(true);
    setError(null);

    const supabase = createSupabaseBrowserClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }
    router.push("/admin/products");
  }

  return (
    <section className="surface-card mx-auto max-w-md p-6">
      <h1 className="mb-4 font-outfit text-2xl font-semibold text-headline">Admin login</h1>
      <form className="space-y-4" onSubmit={onSubmit}>
        <input
          name="email"
          type="email"
          required
          placeholder="admin@email.com"
          className="input-dark w-full"
        />
        <input
          name="password"
          type="password"
          required
          placeholder="Password"
          className="input-dark w-full"
        />
        {error && <p className="text-sm text-red-400">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="btn-accent-fill w-full justify-center disabled:opacity-50"
        >
          <span>{loading ? "Signing in..." : "Sign in"}</span>
        </button>
      </form>
    </section>
  );
}
