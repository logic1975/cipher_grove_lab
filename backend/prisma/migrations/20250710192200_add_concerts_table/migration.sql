-- CreateTable
CREATE TABLE "concerts" (
    "id" SERIAL NOT NULL,
    "artist_id" INTEGER NOT NULL,
    "venue" VARCHAR(255) NOT NULL,
    "city" VARCHAR(100) NOT NULL,
    "country" VARCHAR(100) NOT NULL,
    "date" DATE NOT NULL,
    "time" TIME,
    "ticket_link" VARCHAR(500),
    "notes" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "concerts_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "idx_concerts_artist_id" ON "concerts"("artist_id");

-- CreateIndex
CREATE INDEX "idx_concerts_date" ON "concerts"("date");

-- CreateIndex
CREATE INDEX "idx_concerts_city" ON "concerts"("city");

-- CreateIndex
CREATE INDEX "idx_concerts_created_at" ON "concerts"("created_at" DESC);

-- AddForeignKey
ALTER TABLE "concerts" ADD CONSTRAINT "concerts_artist_id_fkey" FOREIGN KEY ("artist_id") REFERENCES "artists"("id") ON DELETE CASCADE ON UPDATE CASCADE;
