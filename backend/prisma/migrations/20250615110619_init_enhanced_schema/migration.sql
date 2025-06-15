-- CreateEnum
CREATE TYPE "release_type" AS ENUM ('album', 'single', 'ep');

-- CreateTable
CREATE TABLE "artists" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "bio" TEXT,
    "image_url" VARCHAR(500),
    "image_alt" VARCHAR(255),
    "image_sizes" JSONB NOT NULL DEFAULT '{}',
    "social_links" JSONB NOT NULL DEFAULT '{}',
    "is_featured" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "artists_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "releases" (
    "id" SERIAL NOT NULL,
    "artist_id" INTEGER NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "type" "release_type" NOT NULL,
    "release_date" DATE NOT NULL,
    "cover_art_url" VARCHAR(500),
    "cover_art_alt" VARCHAR(255),
    "cover_art_sizes" JSONB NOT NULL DEFAULT '{}',
    "streaming_links" JSONB NOT NULL DEFAULT '{}',
    "description" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "releases_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "news" (
    "id" SERIAL NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "content" TEXT NOT NULL,
    "author" VARCHAR(100) NOT NULL DEFAULT 'Music Label',
    "slug" VARCHAR(255),
    "published_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "news_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "artists_name_key" ON "artists"("name");

-- CreateIndex
CREATE INDEX "artists_name_idx" ON "artists"("name");

-- CreateIndex
CREATE INDEX "idx_artists_featured" ON "artists"("is_featured");

-- CreateIndex
CREATE INDEX "idx_artists_created_at" ON "artists"("created_at" DESC);

-- CreateIndex
CREATE INDEX "idx_releases_artist_id" ON "releases"("artist_id");

-- CreateIndex
CREATE INDEX "idx_releases_release_date" ON "releases"("release_date" DESC);

-- CreateIndex
CREATE INDEX "idx_releases_type" ON "releases"("type");

-- CreateIndex
CREATE INDEX "idx_releases_created_at" ON "releases"("created_at" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "news_slug_key" ON "news"("slug");

-- CreateIndex
CREATE INDEX "idx_news_published_at" ON "news"("published_at" DESC);

-- CreateIndex
CREATE INDEX "idx_news_slug" ON "news"("slug");

-- CreateIndex
CREATE INDEX "idx_news_created_at" ON "news"("created_at" DESC);

-- AddForeignKey
ALTER TABLE "releases" ADD CONSTRAINT "releases_artist_id_fkey" FOREIGN KEY ("artist_id") REFERENCES "artists"("id") ON DELETE CASCADE ON UPDATE CASCADE;
