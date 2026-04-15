-- CreateEnum
CREATE TYPE "ScenarioType" AS ENUM ('cpu_spike', 'memory_leak', 'http_errors', 'system_error', 'latency_spike', 'custom');

-- CreateEnum
CREATE TYPE "RunStatus" AS ENUM ('PENDING', 'RUNNING', 'SUCCESS', 'FAILED');

-- CreateTable
CREATE TABLE "ScenarioRun" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "ScenarioType" NOT NULL,
    "status" "RunStatus" NOT NULL DEFAULT 'PENDING',
    "durationMs" INTEGER,
    "errorMsg" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ScenarioRun_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ScenarioRun_type_idx" ON "ScenarioRun"("type");

-- CreateIndex
CREATE INDEX "ScenarioRun_status_idx" ON "ScenarioRun"("status");

-- CreateIndex
CREATE INDEX "ScenarioRun_createdAt_idx" ON "ScenarioRun"("createdAt");
