import Link from "next/link";

export default function CancelPage() {
  return (
    <section className="surface-card mx-auto max-w-xl p-8 text-center">
      <h1 className="font-outfit text-2xl font-semibold text-red-400">Payment canceled</h1>
      <p className="mt-3 text-muted">
        Your payment was not completed. You can review the cart and try again.
      </p>
      <Link href="/cart" className="btn-accent-fill mt-8 inline-flex justify-center">
        <span>Back to cart</span>
      </Link>
    </section>
  );
}
