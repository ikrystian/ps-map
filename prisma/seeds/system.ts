import {
  BugReportCategory,
  BugReportStatus,
  JobRunStatus,
  LogLevel,
  PrismaClient,
} from "@prisma/client";
import { getJobDefinitions } from "../../lib/scheduler";

export async function seedSystem(prisma: PrismaClient, adminUser: any, clients: any[], lawFirms: any[]) {
  console.log("Seeding system infrastructure (scheduled jobs, run history, bug reports, system logs, audit trails)...");

  // ==========================================================================
  // 1. HARMONOGRAM ZADAŃ (ScheduledJob) + HISTORIA URUCHOMIEŃ (ScheduledJobRun)
  // ==========================================================================
  const jobDefinitions = getJobDefinitions();

  for (let i = 0; i < jobDefinitions.length; i++) {
    const def = jobDefinitions[i];
    const lastRunTime = new Date(Date.now() - (i * 15 + 5) * 60 * 1000);

    const job = await prisma.scheduledJob.upsert({
      where: { jobName: def.name },
      create: {
        jobName: def.name,
        lastRunAt: lastRunTime,
        lastStatus: JobRunStatus.SUCCESS,
      },
      update: {
        lastRunAt: lastRunTime,
        lastStatus: JobRunStatus.SUCCESS,
      },
    });

    // Dodaj wpis historii uruchomienia
    const startTime = new Date(lastRunTime.getTime() - 250);
    await prisma.scheduledJobRun.create({
      data: {
        jobName: job.jobName,
        status: JobRunStatus.SUCCESS,
        attempt: 1,
        startedAt: startTime,
        finishedAt: lastRunTime,
        durationMs: 250,
        result: JSON.stringify({ processedCount: Math.floor(Math.random() * 10) + 1, message: "OK" }),
      },
    });
  }

  // ==========================================================================
  // 2. ZGŁOSZENIA BŁĘDÓW (BugReport)
  // ==========================================================================
  const firstFirm = lawFirms[0];
  const secondFirm = lawFirms[1];

  if (firstFirm?.userId) {
    await prisma.bugReport.create({
      data: {
        userId: firstFirm.userId,
        opis: "Podczas pobierania zestawienia prowizji do PDF na urządzeniach mobilnych z iOS Safari prawa kolumna tabeli była lekko przycięta.",
        url: "/panel-eksperta/faktury",
        kategoria: BugReportCategory.UI_UX,
        status: BugReportStatus.ZAAKCEPTOWANE,
        adminNotatka: "Naprawiono w wydaniu v1.2.4 poprzez dostosowanie viewportu i marginesów. Przyznano 50 pkt nagrody.",
        punktyPrzyznane: true,
        createdAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
      },
    });
  }

  if (secondFirm?.userId) {
    await prisma.bugReport.create({
      data: {
        userId: secondFirm.userId,
        opis: "W formularzu edycji godzin otwarcia przycisk kopiowania godzin z poniedziałku na pozostałe dni nie kopiuje pola piątku.",
        url: "/panel-eksperta/profil",
        kategoria: BugReportCategory.FUNKCJONALNY,
        status: BugReportStatus.NOWE,
        adminNotatka: null,
        punktyPrzyznane: false,
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      },
    });
  }

  // ==========================================================================
  // 3. LOGI SYSTEMOWE (SystemLog)
  // ==========================================================================
  const logs = [
    { level: LogLevel.INFO, action: "USER_LOGIN", message: "Pomyślne logowanie administratora: admin@ps-dev.com.pl", ip: "83.24.112.5" },
    { level: LogLevel.INFO, action: "ORDER_COMPLETED", message: "Zaksięgowano płatność za zamówienie subskrypcji pakietu Biznes", ip: "195.150.9.37" },
    { level: LogLevel.INFO, action: "CASE_CREATED", message: "Klient utworzył nową sprawę: Rozwód z orzeczeniem o winie małżonka", ip: "89.64.12.98" },
    { level: LogLevel.INFO, action: "SCHEDULER_JOB", message: "Zakończono cykliczne zadanie: rankings (zaktualizowano pozycje)", ip: "127.0.0.1" },
    { level: LogLevel.WARNING, action: "REVIEW_REPORTED", message: "Kancelaria zgłosiła opinię do moderacji (naruszenie regulaminu)", ip: "83.24.112.5" },
  ];

  for (const log of logs) {
    await prisma.systemLog.create({
      data: {
        level: log.level,
        action: log.action,
        message: log.message,
        userId: adminUser?.id,
        ipAddress: log.ip,
        createdAt: new Date(Date.now() - Math.floor(Math.random() * 3 * 24 * 60 * 60 * 1000)),
      },
    });
  }

  // ==========================================================================
  // 4. HISTORIA LOGOWAŃ (LoginHistory) & AUDYT RODO (RegistrationAuditLog)
  // ==========================================================================
  if (adminUser) {
    await prisma.loginHistory.create({
      data: {
        userId: adminUser.id,
        success: true,
        ipAddress: "83.24.112.5",
        userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36",
        location: "Warszawa, Polska",
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
      },
    });
  }

  if (firstFirm?.userId) {
    await prisma.loginHistory.create({
      data: {
        userId: firstFirm.userId,
        success: true,
        ipAddress: "89.64.33.12",
        userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Safari/605.1.15",
        location: "Warszawa, Polska",
        createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000),
      },
    });

    await prisma.registrationAuditLog.create({
      data: {
        userId: firstFirm.userId,
        role: "LAW_FIRM",
        zgodaRegulamin: true,
        zgodaNewsletter: true,
        zgodaMarketing: true,
        zgodaPrzetwarzanie: true,
        ipAddress: "89.64.33.12",
        userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15",
        browser: "Safari",
        browserVersion: "17.4",
        os: "macOS",
        osVersion: "10.15.7",
        deviceType: "Desktop",
        language: "pl-PL",
        timezone: "Europe/Warsaw",
      },
    });
  }

  console.log(`✓ Zarejestrowano definicje schedulerów (${jobDefinitions.length}), logi wykonań, zgłoszenia błędów, audyt RODO i historię logowań`);
}
