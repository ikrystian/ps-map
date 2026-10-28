import { PrismaClient, QuestionType } from "@prisma/client";

export async function seedSurveys(prisma: PrismaClient, lawFirms: any[]) {
  console.log("Seeding surveys (polls, questions, options, responses and answers)...");

  const survey = await prisma.survey.create({
    data: {
      tytul: "Badanie potrzeb technologicznych i rozwoju rynku usług prawnych 2026",
      opis: "Krótka ankieta badająca wykorzystanie sztucznej inteligencji, automatyzacji procesów oraz systemu KSeF w codziennej pracy kancelarii.",
      aktywna: true,
      nagrodaPunktow: 15,
    },
  });

  const q1 = await prisma.surveyQuestion.create({
    data: {
      surveyId: survey.id,
      kolejnosc: 1,
      tresc: "Czy w Twojej kancelarii wykorzystywane są narzędzia sztucznej inteligencji (Generative AI)?",
      typ: QuestionType.SINGLE,
    },
  });

  const o1_1 = await prisma.surveyOption.create({ data: { questionId: q1.id, kolejnosc: 1, tresc: "Tak, regularnie do researchu orzecznictwa i draftowania pism" } });
  const o1_2 = await prisma.surveyOption.create({ data: { questionId: q1.id, kolejnosc: 2, tresc: "Tak, okazjonalnie jako wsparcie redakcyjne" } });
  const o1_3 = await prisma.surveyOption.create({ data: { questionId: q1.id, kolejnosc: 3, tresc: "Planujemy wdrożenie w ciągu 6 miesięcy" } });
  const o1_4 = await prisma.surveyOption.create({ data: { questionId: q1.id, kolejnosc: 4, tresc: "Nie korzystamy z obawy o tajemnicę zawodową i bezpieczeństwo danych" } });

  const q2 = await prisma.surveyQuestion.create({
    data: {
      surveyId: survey.id,
      kolejnosc: 2,
      tresc: "Z jakich funkcjonalności platformy ProstaSprawa korzystasz najchętniej?",
      typ: QuestionType.MULTIPLE,
    },
  });

  const o2_1 = await prisma.surveyOption.create({ data: { questionId: q2.id, kolejnosc: 1, tresc: "Marketplace spraw i składanie ofert klientom" } });
  const o2_2 = await prisma.surveyOption.create({ data: { questionId: q2.id, kolejnosc: 2, tresc: "Kalendarz i konsultacje wideo Google Meet" } });
  const o2_3 = await prisma.surveyOption.create({ data: { questionId: q2.id, kolejnosc: 3, tresc: "Pozycjonowanie wizytówki i promowanie profilu" } });
  const o2_4 = await prisma.surveyOption.create({ data: { questionId: q2.id, kolejnosc: 4, tresc: "Publikacja artykułów na blogu serwisu" } });

  const q3 = await prisma.surveyQuestion.create({
    data: {
      surveyId: survey.id,
      kolejnosc: 3,
      tresc: "Jak oceniasz stopień przygotowania swojej organizacji do wdrożenia KSeF 2.0?",
      typ: QuestionType.SINGLE,
    },
  });

  const o3_1 = await prisma.surveyOption.create({ data: { questionId: q3.id, kolejnosc: 1, tresc: "Pełna gotowość – systemy i procedury przetestowane" } });
  const o3_2 = await prisma.surveyOption.create({ data: { questionId: q3.id, kolejnosc: 2, tresc: "W trakcie wdrażania i szkoleń personelu" } });
  const o3_3 = await prisma.surveyOption.create({ data: { questionId: q3.id, kolejnosc: 3, tresc: "Dopiero analizujemy wymagania techniczne i prawne" } });

  // Odpowiedzi od wybranych 3 kancelarii
  const respondents = lawFirms.slice(0, 3);
  for (const firm of respondents) {
    const resp = await prisma.surveyResponse.create({
      data: {
        surveyId: survey.id,
        lawFirmId: firm.id,
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      },
    });

    await prisma.surveyAnswer.create({
      data: {
        responseId: resp.id,
        questionId: q1.id,
        optionId: o1_1.id,
      },
    });

    await prisma.surveyAnswer.create({
      data: {
        responseId: resp.id,
        questionId: q2.id,
        optionId: o2_1.id,
      },
    });

    await prisma.surveyAnswer.create({
      data: {
        responseId: resp.id,
        questionId: q3.id,
        optionId: o3_1.id,
      },
    });
  }

  console.log(`✓ Utworzono ankietę branżową z pytaniami jednokrotnego i wielokrotnego wyboru oraz odpowiedzi kancelarii`);
}
