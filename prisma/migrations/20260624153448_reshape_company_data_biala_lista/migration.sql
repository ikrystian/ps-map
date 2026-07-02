/*
  Warnings:

  - You are about to drop the column `COMPANY_adresDoreczenBudynek` on the `CompanyData` table. All the data in the column will be lost.
  - You are about to drop the column `COMPANY_adresDoreczenGmina` on the `CompanyData` table. All the data in the column will be lost.
  - You are about to drop the column `COMPANY_adresDoreczenKodPocztowy` on the `CompanyData` table. All the data in the column will be lost.
  - You are about to drop the column `COMPANY_adresDoreczenMiejscowosc` on the `CompanyData` table. All the data in the column will be lost.
  - You are about to drop the column `COMPANY_adresDoreczenOpisNietypowegoMiejscaLokalizacji` on the `CompanyData` table. All the data in the column will be lost.
  - You are about to drop the column `COMPANY_adresDoreczenPoczta` on the `CompanyData` table. All the data in the column will be lost.
  - You are about to drop the column `COMPANY_adresDoreczenPowiat` on the `CompanyData` table. All the data in the column will be lost.
  - You are about to drop the column `COMPANY_adresDoreczenSIMC` on the `CompanyData` table. All the data in the column will be lost.
  - You are about to drop the column `COMPANY_adresDoreczenTERC` on the `CompanyData` table. All the data in the column will be lost.
  - You are about to drop the column `COMPANY_adresDoreczenULIC` on the `CompanyData` table. All the data in the column will be lost.
  - You are about to drop the column `COMPANY_adresDoreczenWojewodztwo` on the `CompanyData` table. All the data in the column will be lost.
  - You are about to drop the column `COMPANY_adresGlownyBudynek` on the `CompanyData` table. All the data in the column will be lost.
  - You are about to drop the column `COMPANY_adresGlownyGmina` on the `CompanyData` table. All the data in the column will be lost.
  - You are about to drop the column `COMPANY_adresGlownyKodPocztowy` on the `CompanyData` table. All the data in the column will be lost.
  - You are about to drop the column `COMPANY_adresGlownyMiejscowosc` on the `CompanyData` table. All the data in the column will be lost.
  - You are about to drop the column `COMPANY_adresGlownyOpisNietypowegoMiejscaLokalizacji` on the `CompanyData` table. All the data in the column will be lost.
  - You are about to drop the column `COMPANY_adresGlownyPoczta` on the `CompanyData` table. All the data in the column will be lost.
  - You are about to drop the column `COMPANY_adresGlownyPowiat` on the `CompanyData` table. All the data in the column will be lost.
  - You are about to drop the column `COMPANY_adresGlownySIMC` on the `CompanyData` table. All the data in the column will be lost.
  - You are about to drop the column `COMPANY_adresGlownyTERC` on the `CompanyData` table. All the data in the column will be lost.
  - You are about to drop the column `COMPANY_adresGlownyULIC` on the `CompanyData` table. All the data in the column will be lost.
  - You are about to drop the column `COMPANY_adresGlownyWojewodztwo` on the `CompanyData` table. All the data in the column will be lost.
  - You are about to drop the column `COMPANY_adresPocztyElektronicznej` on the `CompanyData` table. All the data in the column will be lost.
  - You are about to drop the column `COMPANY_adresStronyInternetowej` on the `CompanyData` table. All the data in the column will be lost.
  - You are about to drop the column `COMPANY_dataRozpoczeciaDzialalnosci` on the `CompanyData` table. All the data in the column will be lost.
  - You are about to drop the column `COMPANY_dataWykresleniaWpisuZRejestru` on the `CompanyData` table. All the data in the column will be lost.
  - You are about to drop the column `COMPANY_dataWznowieniaDzialalnosci` on the `CompanyData` table. All the data in the column will be lost.
  - You are about to drop the column `COMPANY_dataZaprzestaniaDzialalnosci` on the `CompanyData` table. All the data in the column will be lost.
  - You are about to drop the column `COMPANY_dataZawieszeniaDzialalnosci` on the `CompanyData` table. All the data in the column will be lost.
  - You are about to drop the column `COMPANY_faks` on the `CompanyData` table. All the data in the column will be lost.
  - You are about to drop the column `COMPANY_firma` on the `CompanyData` table. All the data in the column will be lost.
  - You are about to drop the column `COMPANY_identyfikatorWpisu` on the `CompanyData` table. All the data in the column will be lost.
  - You are about to drop the column `COMPANY_imie` on the `CompanyData` table. All the data in the column will be lost.
  - You are about to drop the column `COMPANY_informacjeUpadlosc` on the `CompanyData` table. All the data in the column will be lost.
  - You are about to drop the column `COMPANY_kodyPKD` on the `CompanyData` table. All the data in the column will be lost.
  - You are about to drop the column `COMPANY_malzenskaWspolnoscMajatkowa` on the `CompanyData` table. All the data in the column will be lost.
  - You are about to drop the column `COMPANY_nazwisko` on the `CompanyData` table. All the data in the column will be lost.
  - You are about to drop the column `COMPANY_pelnomocnicy` on the `CompanyData` table. All the data in the column will be lost.
  - You are about to drop the column `COMPANY_przedsiebiorcaPosiadaObywatelstwaPanstw` on the `CompanyData` table. All the data in the column will be lost.
  - You are about to drop the column `COMPANY_spolkiCywilne` on the `CompanyData` table. All the data in the column will be lost.
  - You are about to drop the column `COMPANY_status` on the `CompanyData` table. All the data in the column will be lost.
  - You are about to drop the column `COMPANY_telefon` on the `CompanyData` table. All the data in the column will be lost.
  - You are about to drop the column `COMPANY_uprawnienia` on the `CompanyData` table. All the data in the column will be lost.
  - You are about to drop the column `COMPANY_zakazy` on the `CompanyData` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_CompanyData" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "COMPANY_searchNip" TEXT,
    "COMPANY_name" TEXT,
    "COMPANY_nip" TEXT,
    "COMPANY_statusVat" TEXT,
    "COMPANY_regon" TEXT,
    "COMPANY_pesel" TEXT,
    "COMPANY_krs" TEXT,
    "COMPANY_residenceAddress" TEXT,
    "COMPANY_workingAddress" TEXT,
    "COMPANY_registrationLegalDate" TEXT,
    "COMPANY_registrationDenialBasis" TEXT,
    "COMPANY_registrationDenialDate" TEXT,
    "COMPANY_restorationBasis" TEXT,
    "COMPANY_restorationDate" TEXT,
    "COMPANY_removalBasis" TEXT,
    "COMPANY_removalDate" TEXT,
    "COMPANY_exemptionSmeDate" TEXT,
    "COMPANY_accountNumbers" TEXT,
    "COMPANY_hasVirtualAccounts" TEXT,
    "COMPANY_representatives" TEXT,
    "COMPANY_authorizedClerks" TEXT,
    "COMPANY_partners" TEXT,
    "COMPANY_requestId" TEXT,
    "COMPANY_requestDateTime" TEXT,
    "COMPANY_rawResponse" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "CompanyData_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_CompanyData" ("COMPANY_nip", "COMPANY_rawResponse", "COMPANY_regon", "COMPANY_searchNip", "createdAt", "id", "updatedAt", "userId") SELECT "COMPANY_nip", "COMPANY_rawResponse", "COMPANY_regon", "COMPANY_searchNip", "createdAt", "id", "updatedAt", "userId" FROM "CompanyData";
DROP TABLE "CompanyData";
ALTER TABLE "new_CompanyData" RENAME TO "CompanyData";
CREATE UNIQUE INDEX "CompanyData_userId_key" ON "CompanyData"("userId");
CREATE INDEX "CompanyData_userId_idx" ON "CompanyData"("userId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
