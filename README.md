# AxisX Store

Production-ready eCommerce MVP for small stores using Next.js App Router, Supabase, PayHere Checkout, and Zustand.

## Setup

1. Install dependencies:
   - `npm install`
2. Copy env file:
   - `cp .env.example .env.local` (or create manually on Windows)
3. Fill all required environment variables.
4. Run SQL in `supabase/schema.sql` inside Supabase SQL editor.
5. Start development server:
   - `npm run dev`

## Included MVP features

- Product listing and detail pages
- Product search and category filtering
- Client cart with Zustand + localStorage persistence
- Sticky navbar with quick cart drawer
- Secure server-side PayHere checkout payload generation
- PayHere notify webhook verification and order persistence
- Admin login and product CRUD + stock/visibility/category update
- Admin role check via `admin_users` table
- Multi-image upload for products via Supabase Storage
- Drag-drop uploader with preview/reorder/remove
- Server-side image compression (WebP) before storage
- Product images are file-upload only (no manual URL input)

## Security notes

- Frontend prices are never trusted for checkout.
- Checkout route fetches current product prices from Supabase.
- Orders are created as `pending` and finalized on PayHere notify callback.
- Notify signature (`md5sig`) is validated before any paid update.
- RLS policies restrict product write operations to admin users.

## Admin role setup

1. Create an auth user in Supabase Auth.
2. Insert that user ID into `admin_users`:
   - `insert into admin_users (user_id) values ('<auth-user-uuid>');`
3. Create a public storage bucket named `product-images` in Supabase Storage.

## PayHere setup

1. Add PayHere credentials in `.env.local`:
   - `PAYHERE_MERCHANT_ID`
   - `PAYHERE_MERCHANT_SECRET`
   - `PAYHERE_SANDBOX=true` for sandbox
   - `NEXT_PUBLIC_PAYHERE_SANDBOX=true` (must match sandbox for modal SDK script)
2. Set your PayHere notify URL to:
   - `https://your-domain.com/api/payhere-notify`
   - Local test: `http://localhost:3000/api/payhere-notify` (if publicly reachable/tunneled)
