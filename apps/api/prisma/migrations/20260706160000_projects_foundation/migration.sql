ALTER TYPE "ProjectStatus" RENAME TO "ProjectStatus_old";

CREATE TYPE "ProjectStatus" AS ENUM ('DRAFT', 'COMING_SOON', 'OPEN', 'FUNDED', 'CLOSED', 'ARCHIVED');
CREATE TYPE "ProjectVisibility" AS ENUM ('PRIVATE', 'INVESTORS', 'PUBLIC');

ALTER TABLE "Project"
ADD COLUMN "description" TEXT,
ADD COLUMN "investmentType" TEXT NOT NULL DEFAULT 'Unspecified',
ADD COLUMN "location" TEXT NOT NULL DEFAULT 'Unspecified',
ADD COLUMN "minimumInvestment" DECIMAL(18,2) NOT NULL DEFAULT 0,
ADD COLUMN "targetRaise" DECIMAL(18,2) NOT NULL DEFAULT 0,
ADD COLUMN "raisedAmount" DECIMAL(18,2) NOT NULL DEFAULT 0,
ADD COLUMN "expectedReturn" TEXT NOT NULL DEFAULT 'TBD',
ADD COLUMN "investmentTerm" TEXT NOT NULL DEFAULT 'TBD',
ADD COLUMN "openingDate" TIMESTAMP(3),
ADD COLUMN "closingDate" TIMESTAMP(3),
ADD COLUMN "heroImageUrl" TEXT,
ADD COLUMN "coverImageUrl" TEXT,
ADD COLUMN "visibility" "ProjectVisibility" NOT NULL DEFAULT 'INVESTORS',
ADD COLUMN "deletedAt" TIMESTAMP(3);

ALTER TABLE "Project"
ALTER COLUMN "investmentType" DROP DEFAULT,
ALTER COLUMN "location" DROP DEFAULT,
ALTER COLUMN "expectedReturn" DROP DEFAULT,
ALTER COLUMN "investmentTerm" DROP DEFAULT;

ALTER TABLE "Project"
ALTER COLUMN "status" DROP DEFAULT;

ALTER TABLE "Project"
ALTER COLUMN "status" TYPE "ProjectStatus"
USING (
  CASE "status"::text
    WHEN 'ACTIVE' THEN 'OPEN'
    WHEN 'COMPLETED' THEN 'FUNDED'
    ELSE "status"::text
  END
)::"ProjectStatus";

ALTER TABLE "Project"
ALTER COLUMN "status" SET DEFAULT 'DRAFT';

DROP TYPE "ProjectStatus_old";

CREATE INDEX "Project_location_idx" ON "Project"("location");
CREATE INDEX "Project_investmentType_idx" ON "Project"("investmentType");
CREATE INDEX "Project_visibility_idx" ON "Project"("visibility");
CREATE INDEX "Project_deletedAt_idx" ON "Project"("deletedAt");
CREATE INDEX "Project_createdAt_idx" ON "Project"("createdAt");
CREATE INDEX "Project_deletedAt_status_idx" ON "Project"("deletedAt", "status");
CREATE INDEX "Project_deletedAt_visibility_idx" ON "Project"("deletedAt", "visibility");
