-- CreateTable
CREATE TABLE "golfers" (
    "id" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastInitial" VARCHAR(1) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "golfers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "signups" (
    "id" TEXT NOT NULL,
    "golferId" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "signups_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "golfers_firstName_lastInitial_key" ON "golfers"("firstName", "lastInitial");

-- CreateIndex
CREATE UNIQUE INDEX "signups_golferId_date_key" ON "signups"("golferId", "date");

-- AddForeignKey
ALTER TABLE "signups" ADD CONSTRAINT "signups_golferId_fkey" FOREIGN KEY ("golferId") REFERENCES "golfers"("id") ON DELETE CASCADE ON UPDATE CASCADE;
