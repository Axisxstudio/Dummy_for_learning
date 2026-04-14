export function Footer() {
  return (
    <footer className="border-t border-white/10 py-8">
      <div className="mx-auto max-w-6xl px-4 text-sm text-muted">
        {new Date().getFullYear()} AxisX Store. Built with Next.js, Supabase, and PayHere.
      </div>
    </footer>
  );
}
