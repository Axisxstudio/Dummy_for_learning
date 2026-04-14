"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { CartItem } from "@/components/cart-item";
import { useCartStore } from "@/store/cart-store";

const LAST_ORDER_ITEMS_KEY = "axisx-last-order-items";
const CHECKOUT_CUSTOMER_KEY = "axisx-checkout-customer";

function waitForPayHere(maxAttempts = 200, intervalMs = 100) {
  return new Promise<void>((resolve, reject) => {
    let n = 0;
    const t = setInterval(() => {
      if (typeof window !== "undefined" && window.payhere?.startPayment) {
        clearInterval(t);
        resolve();
      } else if (++n >= maxAttempts) {
        clearInterval(t);
        reject(new Error("PayHere script did not load. Refresh the page and try again."));
      }
    }, intervalMs);
  });
}

export default function CartPage() {
  const router = useRouter();
  const clearCart = useCartStore((s) => s.clearCart);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("Guest");
  const [lastName, setLastName] = useState("User");
  const [phone, setPhone] = useState("0770000000");
  const [address, setAddress] = useState("Colombo");
  const [city, setCity] = useState("Colombo");
  const [country, setCountry] = useState("Sri Lanka");
  const items = useCartStore((s) => s.items);
  const total = useMemo(
    () => items.reduce((sum, item) => sum + item.price_lkr * item.quantity, 0),
    [items]
  );

  useEffect(() => {
    if (typeof window === "undefined") return;
    const raw = localStorage.getItem(CHECKOUT_CUSTOMER_KEY);
    if (!raw) return;
    try {
      const saved = JSON.parse(raw) as Partial<{
        firstName: string;
        lastName: string;
        email: string;
        phone: string;
        address: string;
        city: string;
        country: string;
      }>;
      if (saved.firstName) setFirstName(saved.firstName);
      if (saved.lastName) setLastName(saved.lastName);
      if (saved.email) setEmail(saved.email);
      if (saved.phone) setPhone(saved.phone);
      if (saved.address) setAddress(saved.address);
      if (saved.city) setCity(saved.city);
      if (saved.country) setCountry(saved.country);
    } catch {
      // Ignore invalid saved checkout data.
    }
  }, []);

  function persistCustomerDetails() {
    if (typeof window === "undefined") return;
    localStorage.setItem(
      CHECKOUT_CUSTOMER_KEY,
      JSON.stringify({
        firstName,
        lastName,
        email,
        phone,
        address,
        city,
        country
      })
    );
  }

  async function handleCheckout() {
    if (!items.length) return;
    if (!email) {
      alert("Please enter your email");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items,
          customer: {
            firstName,
            lastName,
            email,
            phone,
            address,
            city,
            country
          }
        })
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "Unable to checkout");
        return;
      }
      if (!data.fields) {
        alert("Unable to start PayHere checkout");
        return;
      }

      await waitForPayHere();
      const ph = window.payhere!;
      const fields = data.fields as Record<string, string>;
      const payment: Record<string, string | boolean> = {
        sandbox: Boolean(data.sandbox),
        ...Object.fromEntries(
          Object.entries(fields).map(([k, v]) => [k, String(v)])
        )
      };

      ph.onCompleted = (orderId) => {
        sessionStorage.setItem(LAST_ORDER_ITEMS_KEY, JSON.stringify(items));
        persistCustomerDetails();
        clearCart();
        router.push(`/checkout/success?order_id=${encodeURIComponent(orderId)}`);
      };
      ph.onDismissed = () => {
        // User closed modal without paying
      };
      ph.onError = (err) => {
        alert(typeof err === "string" ? err : "PayHere error");
      };

      ph.startPayment(payment);
    } catch (e) {
      alert(e instanceof Error ? e.message : "Checkout failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="space-y-8">
      <h1 className="font-outfit text-3xl font-semibold text-headline">Your cart</h1>
      <div className="space-y-4">
        {items.map((item) => (
          <CartItem key={item.id} item={item} />
        ))}
      </div>
      <div className="surface-card p-6">
        <div className="grid gap-3 md:grid-cols-2">
          <input
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            placeholder="First name"
            autoComplete="given-name"
            className="input-dark"
          />
          <input
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            placeholder="Last name"
            autoComplete="family-name"
            className="input-dark"
          />
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            type="email"
            autoComplete="email"
            className="input-dark"
          />
          <input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="Phone"
            autoComplete="tel"
            className="input-dark"
          />
          <input
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="Address"
            autoComplete="street-address"
            className="input-dark md:col-span-2"
          />
          <input
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder="City"
            autoComplete="address-level2"
            className="input-dark"
          />
          <input
            value={country}
            onChange={(e) => setCountry(e.target.value)}
            placeholder="Country"
            autoComplete="country-name"
            className="input-dark"
          />
        </div>
        <p className="mt-4 text-lg font-medium text-headline">
          Total: LKR {total.toLocaleString()}
        </p>
        <button
          type="button"
          onClick={handleCheckout}
          disabled={loading || !items.length}
          className="btn-accent-fill animate-pulse-glow mt-4 glow-accent-soft disabled:pointer-events-none disabled:opacity-40"
        >
          <span>{loading ? "Opening payment…" : "Checkout"}</span>
        </button>
      </div>
    </section>
  );
}
