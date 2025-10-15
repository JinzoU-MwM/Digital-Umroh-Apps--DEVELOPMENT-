# PRD Teknis & Tech Stack — SaaS Travel Umrah–Haji (Untuk Kolaborasi AI)

**Versi:** 1.0
**Tanggal:** 12 Okt 2025
**Ruang Lingkup:** Spesifikasi teknis end‑to‑end agar bisa diparalelkan oleh engineer & AI code‑assist. Fokus pada **Opsi A (single DB + tenant_id + RLS)** dengan jalur upgrade.

---

## 1. Arsitektur Umum

* **Frontend (FE):** Next.js (App Router), TypeScript, TailwindCSS, TanStack Query, PWA.
* **Backend (BE):** NestJS (TypeScript) + Prisma ORM, PostgreSQL, Redis (BullMQ untuk queue).
* **Storage:** Cloudflare R2 (S3 compatible).
* **Auth & RBAC:** NextAuth (email OTP / OAuth) atau Clerk (diputuskan saat implementasi), role: OWNER/ADMIN/FINANCE/OPERATION/SALES/VIEWER.
* **Integrasi:** Xendit/Midtrans (payment), WAHA (WhatsApp self‑host), Postmark/SendGrid (email).
* **Infra:** Docker Compose (dev/prod ringan), Nginx/Caddy proxy, wildcard subdomain `*.appmu.com`.
* **Observabilitas:** OpenTelemetry (opsional), Pino logs, Health endpoints, Uptime monitor.
* **Keamanan:** TLS, RLS Postgres, Secrets via .env + KMS (opsional), audit log.

Diagram ringkas (logical):

```
[Browser/PWA] ──> [Next.js FE] ──> [NestJS API]
                         │             │
                         │             ├─ Prisma ─> PostgreSQL (RLS)
                         │             ├─ BullMQ ─> Redis (jobs)
                         │             ├─ S3 SDK ─> Cloudflare R2
                         │             ├─ Webhooks ⇄ Xendit/Midtrans
                         │             └─ WAHA HTTP API (notifikasi)
```

---

## 2. Struktur Repositori (Monorepo)

```
repo/
  apps/
    web/              # Next.js (FE)
    api/              # NestJS (BE)
    worker/           # Worker BullMQ
  packages/
    ui/               # komponen UI bersama (Tailwind + shadcn)
    config/           # ESLint, TSConfig, Prettier, commitlint
    schemas/          # Zod/JSON Schemas & OpenAPI fragments
  infra/
    docker/           # docker-compose, Dockerfiles, Nginx/Caddy
    db/               # migrasi Prisma, seed, snapshot
  .github/
    workflows/        # CI/CD
```

---

## 3. Standar Kode & Tools

* **Bahasa:** TypeScript full‑stack.
* **Lint/Format:** ESLint (airbnb+custom), Prettier, commitlint (Conventional Commits).
* **Testing:** Vitest/Jest (unit), Supertest (API), Playwright (E2E), Prisma Test Utils (DB).
* **Type‑safety:** Zod untuk DTO/validasi; OpenAPI generator untuk client FE.
* **Doc:** ADR (Architecture Decision Record), README per app, Swagger (auto).

---

## 4. Multi‑Tenancy & RLS (PostgreSQL)

* Semua tabel bisnis memiliki `tenant_id UUID NOT NULL` + index.
* **Session var:** `app.current_tenant` di‑set pada setiap request setelah resolve tenant (subdomain/header).
* **Policy umum (contoh):**

```sql
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON bookings
USING (tenant_id::text = current_setting('app.current_tenant'))
WITH CHECK (tenant_id::text = current_setting('app.current_tenant'));
```

* **Migrasi upgrade:** siap skema `tenant_{slug}` (Pro) dengan generator Prisma per‑schema.

---

## 5. Skema Data (Ringkas)

Entitas inti: `tenants, users, packages, customers, bookings, pilgrims, invoices, payments, notifications, audit_logs`.

### 5.1 Konvensi Kolom

* `id UUID PK`, `tenant_id UUID`, `created_at`, `updated_at`, `deleted_at NULL` (soft delete opsional).
* **Audit**: `created_by`, `updated_by` (user id).

### 5.2 Contoh Prisma (potongan)

```prisma
model Bookings {
  id          String   @id @default(uuid())
  tenant_id   String
  customer_id String
  package_id  String
  status      BookingStatus
  roomType    RoomType
  totalPrice  Int
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}
```

---

## 6. Kontrak API (OpenAPI Ringkas)

Base URL: `https://api.appmu.com/v1`
Auth: Bearer JWT (NextAuth/Clerk), header `X-Tenant-Id` fallback.

### 6.1 Endpoints Kunci

* **Auth**: `POST /auth/login`, `POST /auth/otp`, `GET /auth/me`
* **Tenants**: `GET /tenants/me` (info & limits)
* **Packages**: `GET/POST /packages`, `GET /packages/:id`, `PATCH /packages/:id`
* **CRM/Leads**: `GET/POST /leads`, `PATCH /leads/:id`
* **Customers**: `GET/POST /customers`, `GET /customers/:id`
* **Bookings**: `GET/POST /bookings`, `GET /bookings/:id`, `PATCH /bookings/:id`
* **Invoices**: `GET/POST /invoices`, `PATCH /invoices/:id`, `POST /invoices/:id/pay`
* **Payments (webhook)**: `POST /webhooks/xendit`, `POST /webhooks/midtrans`
* **Pilgrims**: `GET/POST /pilgrims`, `PATCH /pilgrims/:id`
* **Documents**: `POST /uploads/pilgrims/:id`, signed URL S3‑style
* **Ops Trip**: `POST /trips/:id/rooming/auto`, `GET /trips/:id/manifest.csv`
* **Notifications**: `POST /notifications/test`, `POST /events/emit`
* **Reports**: `GET /reports/sales`, `GET /reports/receivables`, `GET /reports/trip-profit`

### 6.2 DTO/Schema (Zod/JSON Schema contoh)

```ts
// packages.create
{
  name: string; periodFrom: string; periodTo: string;
  quota: number; priceQd: number; priceDbl: number; priceTpl: number;
}
// bookings.create
{
  customerId: string; packageId: string; roomType: 'QS'|'DBL'|'TPL';
  terms: { dp: number; remaining: number; dueDate: string; }
}
```

---

## 7. Event & Webhook (Event‑Driven)

**Topic konvensi:** `booking.created`, `invoice.paid`, `document.uploaded`, `reminder.due`, `trip.rooming.completed`.

### 7.1 Skema Event (JSON)

```json
{
  "id": "uuid",
  "tenant_id": "uuid",
  "type": "invoice.paid",
  "occurred_at": "2025-10-12T09:00:00Z",
  "actor": {"user_id": "uuid"},
  "data": {"invoice_id": "uuid", "amount": 5000000, "method": "VA"}
}
```

### 7.2 WAHA Notifikasi (HTTP)

* Endpoint: `POST {WAHA_URL}/api/sendMessage`
* Payload contoh: `{ to, text, templateKey, variables }`
* Rate limit: 10 msg/menit/tenant (MVP) + jitter.

---

## 8. Pembayaran (Xendit/Midtrans)

* **Strategi:** Payment Link / VA / e‑Wallet.
* **Webhooks:** validasi signature, idempotency key, rekam di `payments` + update `invoices.status = PAID`.
* **Retry:** exponential backoff (3x), dead‑letter queue jika gagal.
* **Rekonsiliasi:** laporan periodik (daily) disimpan ke storage.

---

## 9. Konfigurasi Lingkungan (.env contoh)

```
# umum
APP_ENV=production
APP_URL=https://app.appmu.com
API_URL=https://api.appmu.com
COOKIE_DOMAIN=.appmu.com

# database
DATABASE_URL=postgresql://user:pass@db:5432/app

# redis
REDIS_URL=redis://redis:6379

# storage (R2)
S3_ENDPOINT=https://<accountid>.r2.cloudflarestorage.com
S3_ACCESS_KEY_ID=...
S3_SECRET_ACCESS_KEY=...
S3_BUCKET=umrah-saas

# auth (NextAuth / Clerk)
NEXTAUTH_SECRET=...
CLERK_SECRET_KEY=...

# payments
XENDIT_API_KEY=...
MIDTRANS_SERVER_KEY=...

# email
POSTMARK_TOKEN=...

# WAHA
WAHA_URL=http://waha:5000
WAHA_API_KEY=...
```

---

## 10. CI/CD & Kualitas

* **CI:** build + lint + test + prisma migrate check + tsc noEmit.
* **CD:** push tag `v*` → build image, deploy ke VPS/VM (docker compose pull & up), jalankan migrasi.
* **Branching:** trunk‑based (main), feature branches, PR wajib lulus CI.
* **PR Checklist:** test, screenshot/console curl, migration reviewed, security notes.

---

## 11. Observabilitas & Operasional

* **Healthcheck:** `/health` (api, db, redis).
* **Metrics (opsional):** Prometheus exporter.
* **Logs:** JSON, level‑based; korelasi req‑id.
* **Alerting:** uptime robot + error rate threshold.
* **Backup:** pg_dump harian → R2; retensi 30 hari; uji restore mingguan.

---

## 12. Keamanan & Kepatuhan

* **Transport:** HTTPS only, HSTS.
* **Data:** RLS, enkripsi at‑rest (R2 SSE), hashed passwords (argon2) jika pakai credential.
* **PDP:** data minimization, hak akses/hapus/portabilitas; log akses sensitif.
* **Rate limiting:** per IP + per tenant; captcha untuk form publik.
* **Secret mgmt:** .env → nantinya KMS/SSM.

---

## 13. Performa & SLO

* **SLO API:** p95 latency < 500 ms; uptime ≥ 99.5% (MVP).
* **Batasan awal:** 200 req/menit/tenant; batch notifikasi 10/menit; file upload ≤ 10 MB.
* **Indexing:** btree pada (tenant_id, status), (tenant_id, created_at).

---

## 14. I18n & Aksesibilitas

* **FE i18n:** next‑intl, default id‑ID, dukungan en‑US.
* **A11y:** semantik HTML, keyboard nav, kontras WCAG AA.

---

## 15. Feature Flag & Konfigurasi Tenant

* Tabel `tenant_settings` (JSON) untuk: PPN %, format nomor dokumen, limit kuota WA/storage, tema white‑label.
* Feature flag: rooming auto, manifest multi‑maskapai, vendor PO, dsb.

---

## 16. Tugas untuk AI Co‑Dev (Pembagian Modul)

1. **Skema Prisma & migrasi awal** + skrip seed (tenant, user OWNER, paket dummy).
2. **Middleware tenant resolver** (subdomain/header) + set `app.current_tenant`.
3. **RLS policy generator** (SQL) untuk semua tabel bisnis.
4. **OpenAPI + Swagger** (NestJS) + client generator untuk FE.
5. **Module Payments**: endpoint invoice, webhook Xendit/Midtrans (verifikasi signature + idempotensi).
6. **Module Uploads**: pre‑signed URL R2 + validasi mime/ukuran.
7. **Module Notifications**: queue BullMQ, worker, adapter WAHA & email, templating (handlebars/mustache).
8. **Portal Jamaah (FE)**: auth OTP, profil & unggah dokumen, status progres.
9. **Rooming & Manifest**: algoritma simple + export CSV/XLSX (exceljs) + PDF (pdfmake).
10. **Reports**: endpoints agregasi + Metabase embed (opsional) atau FE charts (Recharts).

### 16.1 Gaya Prompt untuk AI

* Sertakan **kontrak DTO Zod**, **acceptance test** (Supertest/Playwright), dan **contoh cURL**.
* Gunakan **type‑safe**; hindari `any`.
* Pastikan setiap query menyertakan `tenant_id` pada `data` (meski ada RLS).
* Tambahkan **idempotency‑key** untuk endpoint yang berpotensi di‑retry.
* Sertakan **error mapping** (400, 401, 403, 404, 409, 422, 429, 500) dengan kode aplikasi.

---

## 17. Contoh Kontrak & cURL

**Create Booking**

```
curl -X POST https://api.appmu.com/v1/bookings \
 -H "Authorization: Bearer <JWT>" \
 -H "X-Tenant-Id: TENANT_SLUG" \
 -H "Content-Type: application/json" \
 -d '{
  "customerId":"...",
  "packageId":"...",
  "roomType":"DBL",
  "terms":{"dp":3000000,"remaining":7000000,"dueDate":"2025-11-01"}
 }'
```

**Webhook Payment (Xendit)** → `POST /webhooks/xendit`

* Validasi `X-CALLBACK-TOKEN`/signature.
* Mapping status → `payments` & `invoices`.

---

## 18. Data Retention & DR

* Retensi dokumen 5 tahun (konfigurable per‑tenant).
* Snapshot DB mingguan + daily diff; DR: restore ke VM lain < 4 jam.
* Simulasi pemulihan 1x/bulan.

---

## 19. Roadmap Teknis (Upgrade)

* **Hybrid schema mode** per‑tenant besar.
* **Dedicated DB** opsi Enterprise (connection routing per tenant).
* **K8s** (HPA) + Redis HA + sharding queue.
* **WAF & Bot protection** di edge (Cloudflare).

---

## 20. Lampiran

* **Template .env.example** (lihat §9).
* **Policy RLS SQL** siap templat.
* **JSON Schema Event** untuk 5 event inti.
* **Checklist PR** & **pipeline CI** YAML contoh.
* **Matriks RBAC** detail (link ke PRD fungsional).

---

## 21. Stack Final & Checklist Integrasi (Siap Eksekusi AI)

### 21.1 Stack Final (dipilih)

* **Monorepo:** NX (apps: `web`, `api`, `worker`; packages: `ui`, `schemas`, `config`).
* **Frontend:** Next.js (App Router) + TS + Tailwind + TanStack Query + PWA. Basis: fork **Nextacular** (multi-tenant & auth & billing UI), ganti Stripe → Xendit/Midtrans.
* **Backend API:** NestJS + Prisma + PostgreSQL (single DB, `tenant_id`, **RLS**).
* **Worker:** NestJS microservice + **BullMQ/Redis** (notifikasi WA/email, ekspor laporan, scheduler).
* **Storage:** Cloudflare R2 (S3 compatible) dengan prefix per-tenant.
* **Auth:** NextAuth/Clerk (JWT berisi `role` & `tenantSlug`).
* **Payments:** Xendit/Midtrans (payment link/VA/e-Wallet) + webhook.
* **WA:** WAHA (self-host) untuk blast/event-trigger (rate limit per tenant).
* **Proxy & Deploy:** Docker Compose + Nginx/Caddy + wildcard `*.appmu.com`.
* **Observability:** Pino logs, healthchecks, uptime monitor.

### 21.2 Struktur Monorepo

```
repo/
  apps/
    web/     # Next.js (fork Nextacular)
    api/     # NestJS API
    worker/  # NestJS Worker (BullMQ)
  packages/
    ui/      # komponen UI shared
    schemas/ # Zod schemas + OpenAPI fragments
    config/  # eslint, prettier, tsconfig, commitlint
  infra/
    docker/  # docker-compose, Dockerfiles, proxy config
    db/      # prisma schema, migrasi, seed
  .github/workflows/ # CI/CD
```

### 21.3 Checklist Integrasi — Langkah Eksekusi

**A. Inisialisasi**

1. Fork Nextacular → `apps/web`.
2. Buat `apps/api` (NestJS) & `apps/worker` (NestJS).
3. Pasang NX & samakan lint/format/tsconfig di `packages/config`.

**B. Multi-tenant & RLS**
4) Tambah `tenant_id UUID NOT NULL` + index pada semua tabel bisnis (Prisma).
5) Aktifkan **RLS** & policy:

```sql
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON bookings
USING (tenant_id::text = current_setting('app.current_tenant'))
WITH CHECK (tenant_id::text = current_setting('app.current_tenant'));
```

6. Middleware API: resolve tenant (subdomain/header `X-Tenant-Id`) → `SELECT set_config('app.current_tenant', $1, false)`.
7. Middleware FE (Next.js): mapping subdomain → header `X-Tenant-Id` untuk panggilan API.

**C. Auth & RBAC**
8) FE pakai NextAuth/Clerk; JWT wajib membawa `sub`, `role`, `tenantSlug`.
9) API verifikasi JWT, map `tenantSlug` → `tenant_id`, terapkan Guard RBAC (OWNER/ADMIN/FINANCE/OPERATION/SALES/VIEWER).

**D. DTO Bersama**
10) Definisikan Zod schemas di `packages/schemas` (Packages, Leads, Customers, Bookings, Pilgrims, Invoices, Payments, Notifications, Reports).
11) Generate OpenAPI (Swagger) di API + optional FE client generator.
12) Implement idempotency-key untuk endpoint create yang sensitif.

**E. Modul API Inti**
13) Packages (CRUD, QS/DBL/TPL, kuota, periode).
14) CRM/Leads (pipeline, notes).
15) Customers/Pilgrims (profil, dokumen, status).
16) Bookings (create/update status, hitung `totalPrice`).
17) Invoices/Payments (nomor unik, due, relasi booking).
18) Reports (sales, receivables aging, trip gross margin, doc status).
19) Audit Logs (write-only untuk aksi penting).

**F. Payments — Xendit/Midtrans**
20) Ganti Stripe komponen di FE → Payment Settings (VA/e-Wallet).
21) `POST /invoices/:id/pay` → buat payment link via Xendit/Midtrans.
22) Webhook: `POST /webhooks/xendit|/midtrans` (validasi signature, idempotency, update `payments` & `invoices.status=PAID`).
23) Worker rekonsiliasi harian (laporan → R2) + dashboard piutang.

**G. Upload Dokumen (R2)**
24) Pre-signed URL endpoint dengan path: `r2://umrah-saas/{tenant_id}/pilgrims/{pilgrim_id}/{filename}`.
25) Validasi mime/ukuran (≤10 MB), simpan metadata ke `documents`.

**H. Notifikasi (Worker BullMQ)**
26) Queue `notifications`, adapter **WAHA** (`sendMessage({to, text|templateKey, variables})`) + rate limit per tenant (10/min + jitter).
27) Adapter email (Postmark/SendGrid).
28) Emit event dari API: `invoice.created`, `invoice.overdue`, `document.missing`, `training.reminder` → push queue.

**I. Operasional Trip**
29) Rooming wizard sederhana (preferensi kamar) → simpan ke `roomings`.
30) Export manifest: `GET /trips/:id/manifest.csv|xlsx|pdf` (exceljs/pdfmake) + template per maskapai.

**J. Portal Jamaah (PWA)**
31) Halaman login OTP, status kelengkapan, unggah dokumen, invoice & riwayat.
32) Event setelah unggah: `document.uploaded`.

**K. Batasan Tenant & White‑Label**
33) `tenant_settings` (JSON): PPN %, limit WA/storage, tema/logo.
34) Middleware limit checker sebelum blast/notifikasi massal.

**L. CI/CD & Deploy**
35) CI: lint, test (unit/e2e), build, `prisma migrate diff`, `tsc --noEmit`.
36) CD: tag `v*` → build images, push registry, deploy compose + `prisma migrate deploy`.
37) Proxy: FE (`appmu.com` & `*.appmu.com`), API (`api.appmu.com`), Worker internal only.

**M. Monitoring, Backup, DR**
38) `/health` untuk api/db/redis; uptime monitor & alert error rate.
39) Backup DB harian ke R2 (retensi 30 hari) + uji restore mingguan.

**N. Uji Penerimaan (End‑to‑End)**
40) Tenant baru → subdomain aktif → login OWNER.
41) Lead → quotation → booking → invoice → payment link → webhook → **PAID**.
42) Jamaah unggah dokumen → status berubah → notifikasi terkirim.
43) Rooming tersimpan; manifest terunduh (CSV/XLSX/PDF).
44) Laporan akurat pada sampel data.
45) **RLS**: data antar tenant terisolasi (uji negatif lulus).

**Catatan Upgrade**

* Siapkan feature flag **“hybrid schema mode”** untuk migrasi bertahap ke schema‑per‑tenant/dedicated DB tanpa perubahan kontrak API.
