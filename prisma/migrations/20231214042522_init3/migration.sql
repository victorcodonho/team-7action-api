/*
  Warnings:

  - You are about to drop the column `subjectId` on the `Question` table. All the data in the column will be lost.
  - You are about to drop the `Subject` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Question" DROP CONSTRAINT "Question_subjectId_fkey";

-- AlterTable
ALTER TABLE "Question" DROP COLUMN "subjectId";

-- DropTable
DROP TABLE "Subject";
