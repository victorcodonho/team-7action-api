/*
  Warnings:

  - Added the required column `code` to the `Quiz` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Quiz" ADD COLUMN     "code" VARCHAR(12) NOT NULL;
