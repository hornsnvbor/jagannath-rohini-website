# Jagannath Mandir Rohini — Backend

FastAPI + PostgreSQL (SQLite for local dev). Handles: donation payments (Razorpay),
membership form, seva form, blog, gallery, admin login, live-darshan status.

## 1. Local setup

```bash
cd backend
python -m venv .venv
source .venv/bin/activate          # Windows: .venv\Scripts\activate
pip install -r requirements.txt

cp .env.example .env
# generate a JWT secret:
python -c "import secrets; print(secrets.token_hex(32))"
# generate the admin password hash:
python scripts/hash_password.py "YourStrongPassword123!"
# paste both into .env, along with your Razorpay TEST keys

uvicorn app.main:app --reload --port 8000
```

Visit `http://127.0.0.1:8000/api/docs` for interactive API docs (disabled automatically
when `ENVIRONMENT=production`).

## 2. Razorpay integration — step by step

1. **Create a Razorpay account** at razorpay.com, complete KYC with the temple
   trust's registration + bank details (same Union Bank account you're already using).
2. **Get API keys**: Dashboard → Settings → API Keys → generate. Start with
   **Test Mode** keys (`rzp_test_...`) while building, switch to Live keys only
   when you're ready to accept real money.
3. Put `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET` in `.env`.
4. **Set up the webhook** (this is the critical security piece):
   - Dashboard → Settings → Webhooks → Add New Webhook
   - URL: `https://your-backend-domain.com/api/donations/webhook`
   - Active events: check `payment.captured` and `payment.failed`
   - Razorpay gives you a **webhook secret** at this step — put it in
     `RAZORPAY_WEBHOOK_SECRET` in `.env`. This is different from your API key secret.
5. **Flow in this codebase**:
   - Frontend calls `POST /api/donations` with donor details + amount → backend
     saves the donor record, creates a Razorpay Order, returns `order_id`.
   - Frontend opens Razorpay Checkout with that `order_id` (see frontend
     `src/pages/Donate.tsx`).
   - On success, frontend calls `POST /api/donations/verify` — this is only
     for showing the user a fast "thank you" message.
   - **The donation is only ever marked `paid` in the database when Razorpay's
     webhook hits `/api/donations/webhook` with a valid signature.** Never trust
     the frontend alone to confirm payment — that's how vibe-coded donation
     sites get faked/exploited.
6. Test with Razorpay's [test card numbers](https://razorpay.com/docs/payments/payments/test-card-details/)
   before going live.
7. When ready: swap in Live keys, re-do the webhook setup pointing at the
   production URL, and do one real ₹1 donation test end-to-end.

## 3. Database

- Local dev uses SQLite (`temple.db`, auto-created).
- Production: set `DATABASE_URL=postgresql://user:pass@host:5432/dbname`
  (Supabase, Railway, Render Postgres, or your own server all work).
- Tables auto-create on first run via `Base.metadata.create_all`. For real
  schema changes later, switch to Alembic migrations (already installed).

## 4. Deploying

- Single container (easiest): `docker compose up -d --build` — serves the built
  frontend AND the API from one FastAPI process, with a bundled Postgres.
  Set `FRONTEND_DIST=../frontend/dist` (already set in docker-compose.yml).
- Render/K8s with a separate DB: set `DATABASE_URL` to your Postgres and host
  the built frontend from `dist/` however you like; the frontend calls the API
  over relative `/api` paths when `VITE_API_BASE_URL` is empty.
- Laravel-style split: if you host the frontend on another domain, point
  `VITE_API_BASE_URL` at the backend during the frontend build and set
  `ALLOWED_ORIGINS` to that domain.

Regardless of host:
- Set every variable in `.env.example` as real environment variables on the host
  — never upload the `.env` file itself.
- Set `ENVIRONMENT=production` — this disables the `/api/docs` page and turns
  on the `Strict-Transport-Security` header.
- Set `ALLOWED_ORIGINS` to your real frontend domain(s) only.
- Put the backend behind HTTPS (Let's Encrypt via Nginx, or the host's managed TLS).
- The frontend reads its Razorpay Key ID at runtime from `GET /api/config`,
  so no build-time env is required for payments.

## 5. Security checklist (see also `/security/vibe-check` at repo root)

- [x] Webhook signature verification (HMAC-SHA256) — payment status only trusted here
- [x] Webhook **idempotency** — processed event ids stored; duplicate deliveries skipped
- [x] Admin routes require a valid JWT (`require_admin` dependency) — returns 401 when missing
- [x] Passwords hashed with bcrypt, never stored plain
- [x] Rate limiting on login (5/min), forms (5/min), donations (10/min)
- [x] Strict Pydantic validation on every input (phone format, PAN format, amount caps)
- [x] CORS locked to exact origins, no wildcard
- [x] Security headers on every response (CSP, X-Frame-Options, nosniff, HSTS in prod, etc.)
- [x] No secrets hardcoded — app refuses to start if required `.env` vars are missing
- [x] Generic error responses to clients; real errors only logged server-side
- [x] Receipt email with PDF 80G receipt sent in a background task on `payment.captured`
- [ ] TODO before going live: run the `vibe-check` AI-CHECKLIST.md audit, add
      file-upload validation if you wire up direct image uploads for the gallery
      instead of pasting URLs.

## 6. Admin API quick reference

| Endpoint | Auth | Purpose |
|---|---|---|
| `POST /api/auth/login` | public (rate-limited) | Get admin JWT |
| `GET /api/donations` | admin | List all donations + donor details |
| `GET /api/forms/membership` | admin | List membership requests |
| `GET /api/forms/seva` | admin | List seva requests |
| `POST /api/blog` | admin | Publish a blog post |
| `POST /api/gallery` | admin | Add a gallery photo |

A proper admin dashboard UI (instead of hitting these with curl/Postman) is a
good next build — happy to build that next once this core is live.
