-- CreateEnum
CREATE TYPE "contact_type" AS ENUM ('demo', 'business', 'general', 'press');

-- CreateTable
CREATE TABLE "contacts" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "subject" VARCHAR(200) NOT NULL,
    "message" TEXT NOT NULL,
    "type" "contact_type" NOT NULL,
    "processed" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "contacts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "newsletter_subscribers" (
    "id" SERIAL NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "subscribed_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "unsubscribed_at" TIMESTAMPTZ(6),

    CONSTRAINT "newsletter_subscribers_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "idx_contact_email" ON "contacts"("email");

-- CreateIndex
CREATE INDEX "idx_contact_type" ON "contacts"("type");

-- CreateIndex
CREATE INDEX "idx_contact_processed" ON "contacts"("processed");

-- CreateIndex
CREATE INDEX "idx_contact_created_at" ON "contacts"("created_at" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "newsletter_subscribers_email_key" ON "newsletter_subscribers"("email");

-- CreateIndex
CREATE INDEX "idx_newsletter_email" ON "newsletter_subscribers"("email");

-- CreateIndex
CREATE INDEX "idx_newsletter_active" ON "newsletter_subscribers"("is_active");

-- CreateIndex
CREATE INDEX "idx_newsletter_subscribed_at" ON "newsletter_subscribers"("subscribed_at" DESC);
