/*
  Warnings:

  - You are about to drop the column `weight` on the `Question` table. All the data in the column will be lost.
  - Added the required column `level` to the `Question` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Question" DROP COLUMN "weight",
ADD COLUMN     "level" TEXT NOT NULL,
ALTER COLUMN "ability" SET DATA TYPE TEXT;
