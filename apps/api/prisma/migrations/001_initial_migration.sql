-- CreateTable
CREATE TABLE "tenants" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "domain" TEXT,
    "plan" TEXT NOT NULL DEFAULT 'STARTER',
    "status" TEXT NOT NULL DEFAULT 'TRIAL',
    "owner_id" TEXT NOT NULL,
    "contact_email" TEXT NOT NULL,
    "contact_phone" TEXT NOT NULL,
    "address" JSONB,
    "settings" JSONB NOT NULL DEFAULT '{}',
    "trial_ends_at" TIMESTAMP(3),
    "subscription_renews_at" TIMESTAMP(3),
    "limits" JSONB NOT NULL DEFAULT '{"users":5,"packages":10,"bookings_per_month":100,"storage_mb":1000,"whatsapp_per_day":50}',
    "usage" JSONB NOT NULL DEFAULT '{"users":0,"packages":0,"bookings_this_month":0,"storage_used_mb":0,"whatsapp_today":0}',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "tenants_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT,
    "role" TEXT NOT NULL DEFAULT 'VIEWER',
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "avatar_url" TEXT,
    "permissions" TEXT[],
    "email_verified_at" TIMESTAMP(3),
    "phone_verified_at" TIMESTAMP(3),
    "last_login_at" TIMESTAMP(3),
    "password_changed_at" TIMESTAMP(3),
    "two_factor_enabled" BOOLEAN NOT NULL DEFAULT false,
    "two_factor_secret" TEXT,
    "refresh_tokens" JSONB NOT NULL DEFAULT '[]',
    "email_otp_code" TEXT,
    "email_otp_expires_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "packages" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "description" TEXT,
    "period_from" TIMESTAMP(3) NOT NULL,
    "period_to" TIMESTAMP(3) NOT NULL,
    "quota" INTEGER NOT NULL,
    "quota_booked" INTEGER NOT NULL DEFAULT 0,
    "hotels" JSONB NOT NULL DEFAULT '[]',
    "flights" JSONB NOT NULL DEFAULT '[]',
    "itinerary" JSONB NOT NULL DEFAULT '[]',
    "price_quad" JSONB NOT NULL,
    "price_triple" JSONB NOT NULL,
    "price_double" JSONB NOT NULL,
    "price_single" JSONB NOT NULL,
    "inclusions" TEXT[],
    "exclusions" TEXT[],
    "terms" TEXT,
    "notes" TEXT,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "featured_image_url" TEXT,
    "gallery_images" TEXT[],
    "documents_required" TEXT[],
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "packages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "customers" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT NOT NULL,
    "address" JSONB,
    "id_type" TEXT NOT NULL,
    "id_number" TEXT NOT NULL,
    "birth_date" TIMESTAMP(3) NOT NULL,
    "gender" TEXT NOT NULL,
    "nationality" TEXT NOT NULL DEFAULT 'Indonesia',
    "company" TEXT,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "customers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bookings" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "customer_id" TEXT NOT NULL,
    "package_id" TEXT NOT NULL,
    "booking_code" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "payment_status" TEXT NOT NULL DEFAULT 'PENDING',
    "room_type" TEXT NOT NULL,
    "number_of_pilgrims" INTEGER NOT NULL,
    "special_requests" TEXT,
    "notes" TEXT,
    "base_price" JSONB NOT NULL,
    "tax_amount" JSONB NOT NULL DEFAULT 0,
    "additional_fees" JSONB NOT NULL DEFAULT 0,
    "discount_amount" JSONB NOT NULL DEFAULT 0,
    "total_price" JSONB NOT NULL,
    "dp_amount" JSONB NOT NULL,
    "dp_paid" JSONB NOT NULL DEFAULT 0,
    "remaining_amount" JSONB NOT NULL,
    "remaining_paid" JSONB NOT NULL DEFAULT 0,
    "total_paid" JSONB NOT NULL DEFAULT 0,
    "booking_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "confirmation_date" TIMESTAMP(3),
    "payment_complete_date" TIMESTAMP(3),
    "departure_date" TIMESTAMP(3) NOT NULL,
    "return_date" TIMESTAMP(3) NOT NULL,
    "created_by" TEXT NOT NULL,
    "updated_by" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "bookings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pilgrims" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "booking_id" TEXT NOT NULL,
    "customer_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "birth_date" TIMESTAMP(3) NOT NULL,
    "birth_place" TEXT NOT NULL,
    "gender" TEXT NOT NULL,
    "id_type" TEXT NOT NULL,
    "id_number" TEXT NOT NULL,
    "passport_number" TEXT,
    "passport_expiry" TIMESTAMP(3),
    "family_relationship" TEXT NOT NULL,
    "phone" TEXT,
    "email" TEXT,
    "address" TEXT,
    "emergency_contact" JSONB,
    "room_number" TEXT,
    "building" TEXT,
    "floor" INTEGER,
    "documents" JSONB NOT NULL DEFAULT '[]',
    "document_completion" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'REGISTERED',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "pilgrims_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "invoices" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "booking_id" TEXT NOT NULL,
    "customer_id" TEXT NOT NULL,
    "invoice_number" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "issue_date" TIMESTAMP(3) NOT NULL,
    "due_date" TIMESTAMP(3) NOT NULL,
    "paid_date" TIMESTAMP(3),
    "items" JSONB NOT NULL,
    "subtotal" JSONB NOT NULL,
    "tax_amount" JSONB NOT NULL DEFAULT 0,
    "discount_amount" JSONB NOT NULL DEFAULT 0,
    "total_amount" JSONB NOT NULL,
    "paid_amount" JSONB NOT NULL DEFAULT 0,
    "remaining_amount" JSONB NOT NULL,
    "notes" TEXT,
    "terms" TEXT,
    "created_by" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "invoices_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payments" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "invoice_id" TEXT NOT NULL,
    "amount" JSONB NOT NULL,
    "method" TEXT NOT NULL,
    "provider" TEXT NOT NULL DEFAULT 'MANUAL',
    "provider_reference" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "paid_at" TIMESTAMP(3),
    "provider_response" JSONB,
    "notes" TEXT,
    "created_by" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "payments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "recipient_id" TEXT,
    "type" TEXT NOT NULL,
    "channel" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "template_data" JSONB,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "scheduled_at" TIMESTAMP(3),
    "sent_at" TIMESTAMP(3),
    "delivered_at" TIMESTAMP(3),
    "failed_at" TIMESTAMP(3),
    "failure_reason" TEXT,
    "priority" TEXT NOT NULL DEFAULT 'NORMAL',
    "external_id" TEXT,
    "provider_response" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "user_id" TEXT,
    "entity" TEXT NOT NULL,
    "entity_id" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "old_values" JSONB,
    "new_values" JSONB,
    "ip_address" TEXT,
    "user_agent" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "tenants_slug_key" ON "tenants"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "tenants_domain_key" ON "tenants"("domain");

-- CreateIndex
CREATE INDEX "users_tenant_id_email_idx" ON "users"("tenant_id", "email");

-- CreateIndex
CREATE INDEX "users_tenant_id_idx" ON "users"("tenant_id");

-- CreateIndex
CREATE INDEX "packages_tenant_id_code_idx" ON "packages"("tenant_id", "code");

-- CreateIndex
CREATE INDEX "packages_tenant_id_idx" ON "packages"("tenant_id");

-- CreateIndex
CREATE INDEX "customers_tenant_id_id_number_idx" ON "customers"("tenant_id", "id_number");

-- CreateIndex
CREATE INDEX "customers_tenant_id_idx" ON "customers"("tenant_id");

-- CreateIndex
CREATE INDEX "bookings_booking_code_key" ON "bookings"("booking_code");

-- CreateIndex
CREATE INDEX "bookings_tenant_id_idx" ON "bookings"("tenant_id");

-- CreateIndex
CREATE INDEX "bookings_tenant_id_status_idx" ON "bookings"("tenant_id", "status");

-- CreateIndex
CREATE INDEX "pilgrims_tenant_id_idx" ON "pilgrims"("tenant_id");

-- CreateIndex
CREATE INDEX "pilgrims_booking_id_idx" ON "pilgrims"("booking_id");

-- CreateIndex
CREATE INDEX "invoices_invoice_number_key" ON "invoices"("invoice_number");

-- CreateIndex
CREATE INDEX "invoices_tenant_id_idx" ON "invoices"("tenant_id");

-- CreateIndex
CREATE INDEX "invoices_tenant_id_status_idx" ON "invoices"("tenant_id", "status");

-- CreateIndex
CREATE INDEX "payments_tenant_id_idx" ON "payments"("tenant_id");

-- CreateIndex
CREATE INDEX "payments_invoice_id_idx" ON "payments"("invoice_id");

-- CreateIndex
CREATE INDEX "notifications_tenant_id_idx" ON "notifications"("tenant_id");

-- CreateIndex
CREATE INDEX "audit_logs_tenant_id_idx" ON "audit_logs"("tenant_id");