import prisma from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"

// GET - Pobierz publiczne ustawienia
export async function GET(request: NextRequest) {
  try {
    // Pobierz ustawienia
    const settings = await prisma.settings.findMany()

    // Konwertuj na obiekt klucz-wartość
    const settingsObject = settings.reduce((acc: Record<string, string>, setting: any) => {
      acc[setting.key] = setting.value
      return acc
    }, {} as Record<string, string>)

    // Dodaj domyślne wartości, jeśli nie istnieją
    if (!settingsObject.maxLawFirmCategories) {
      settingsObject.maxLawFirmCategories = "10"
    }
    if (!settingsObject.maxLawFirmVoivodeships) {
      settingsObject.maxLawFirmVoivodeships = "1"
    }
    if (!settingsObject.maxLawFirmCities) {
      settingsObject.maxLawFirmCities = "3"
    }
    if (!settingsObject.maxLawFirmTags) {
      settingsObject.maxLawFirmTags = "5"
    }
    if (!settingsObject.showExpertTutorial) {
      settingsObject.showExpertTutorial = "false"
    }
    if (!settingsObject.deleteReviewCostRating1) {
      settingsObject.deleteReviewCostRating1 = "500"
    }
    if (!settingsObject.deleteReviewCostRating2) {
      settingsObject.deleteReviewCostRating2 = "300"
    }
    if (!settingsObject.deleteReviewCostRating3) {
      settingsObject.deleteReviewCostRating3 = "100"
    }
    if (!settingsObject.enablePaymentTest) {
      settingsObject.enablePaymentTest = "true"
    }
    if (!settingsObject.enablePaymentPrzelewy24) {
      settingsObject.enablePaymentPrzelewy24 = "true"
    }
    if (!settingsObject.enablePaymentPayU) {
      settingsObject.enablePaymentPayU = "true"
    }
    if (!settingsObject.enablePaymentPrzelew) {
      settingsObject.enablePaymentPrzelew = "true"
    }
    if (!settingsObject.enablePaymentTpay) {
      settingsObject.enablePaymentTpay = "true"
    }
    if (!settingsObject.enableUserSelectionOnLogin) {
      settingsObject.enableUserSelectionOnLogin = "true"
    }
    if (!settingsObject.geographicHierarchy) {
      settingsObject.geographicHierarchy = "voivodeships"
    }
    if (!settingsObject.publicItemsPerPage) {
      settingsObject.publicItemsPerPage = "12"
    }
    if (!settingsObject.promoteConsultedImmediately) {
      settingsObject.promoteConsultedImmediately = "false"
    }
    if (!settingsObject.homepageConsultedCategories) {
      settingsObject.homepageConsultedCategories = "[]"
    }
    if (!settingsObject.comingSoonMode) {
      settingsObject.comingSoonMode = "false"
    }
    if (!settingsObject.pointsToPlnRatio) {
      settingsObject.pointsToPlnRatio = "1"
    }

    return NextResponse.json(settingsObject, { status: 200 })
  } catch (error) {
    console.error("Error fetching settings:", error)
    // Zwróć domyślne wartości w przypadku błędu
    return NextResponse.json(
      {
        maxLawFirmCategories: "10",
        maxLawFirmVoivodeships: "1",
        maxLawFirmCities: "3",
        maxLawFirmTags: "5",
        showExpertTutorial: "false",
        deleteReviewCostRating1: "500",
        deleteReviewCostRating2: "300",
        deleteReviewCostRating3: "100",
        pointsToPlnRatio: "1",
        enablePaymentTest: "true",
        enablePaymentPrzelewy24: "true",
        enablePaymentPayU: "true",
        enablePaymentPrzelew: "true",
        enablePaymentTpay: "true",
        enableUserSelectionOnLogin: "true",
        publicItemsPerPage: "12",
      },
      { status: 200 }
    )
  }
}
