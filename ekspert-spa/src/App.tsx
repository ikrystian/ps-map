import { useEffect, useRef } from "react"
import { Navigate, Route, Routes, useLocation, useNavigate } from "react-router-dom"
import { AppShell } from "./components/AppShell"
import { BrandBackdrop } from "./components/BrandBackdrop"
import { OfflineBar } from "./components/OfflineBar"
import { useAuth } from "./lib/auth"
import { minimizeApp, onAndroidBack, runBackHandler } from "./lib/native"
import { AccountPage } from "./pages/account/AccountPage"
import { BillingPage } from "./pages/account/BillingPage"
import { CheckoutPage } from "./pages/account/CheckoutPage"
import { InvoicesPage } from "./pages/account/InvoicesPage"
import { OrderStatusPage } from "./pages/account/OrderStatusPage"
import { PackagePage } from "./pages/account/PackagePage"
import { PointsPage } from "./pages/account/PointsPage"
import { SettingsPage } from "./pages/account/SettingsPage"
import { CaseDetailPage } from "./pages/cases/CaseDetailPage"
import { CasesPage } from "./pages/cases/CasesPage"
import { NewReferralPage } from "./pages/cases/NewReferralPage"
import { OfferFormPage } from "./pages/cases/OfferFormPage"
import { OffersPage } from "./pages/cases/OffersPage"
import { ReferralsPage } from "./pages/cases/ReferralsPage"
import { BookingsPage } from "./pages/consultations/BookingsPage"
import { RequestDetailPage } from "./pages/consultations/RequestDetailPage"
import { RequestsPage } from "./pages/consultations/RequestsPage"
import { HomePage } from "./pages/HomePage"
import { LoginPage } from "./pages/LoginPage"
import { ChatPage } from "./pages/messages/ChatPage"
import { ConversationsPage } from "./pages/messages/ConversationsPage"

const HOME = "/start"
const TAB_ROOTS = new Set([
  HOME,
  "/sprawy",
  "/sprawy/oferty",
  "/sprawy/polecenia",
  "/konsultacje",
  "/konsultacje/zapytania",
  "/wiadomosci",
  "/konto",
])

/**
 * Sprzętowe „wstecz” na Androidzie: najpierw zamyka arkusz, potem cofa ekran, z zakładki wraca
 * na pulpit, a z pulpitu chowa aplikację, żeby przy powrocie nie startowała od zera.
 */
function useHardwareBack(signedIn: boolean) {
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const state = useRef({ pathname, signedIn })
  state.current = { pathname, signedIn }

  useEffect(
    () =>
      onAndroidBack(() => {
        if (runBackHandler()) return
        const { pathname: path, signedIn: active } = state.current
        if (!active || path === HOME) {
          void minimizeApp()
        } else if (TAB_ROOTS.has(path)) {
          navigate(HOME, { replace: true })
        } else if ((window.history.state?.idx ?? 0) > 0) {
          navigate(-1)
        } else {
          navigate(path.split("/").slice(0, -1).join("/") || HOME, { replace: true })
        }
      }),
    [navigate]
  )
}

export function App() {
  const { status } = useAuth()
  useHardwareBack(status === "authenticated")

  if (status === "loading") return <BrandBackdrop />
  if (status === "anonymous") return <LoginPage />

  return (
    <>
      <OfflineBar />
      <Routes>
        <Route element={<AppShell />}>
          <Route index element={<Navigate to={HOME} replace />} />
          <Route path="start" element={<HomePage />} />
          <Route path="sprawy" element={<CasesPage />} />
          <Route path="sprawy/oferty" element={<OffersPage />} />
          <Route path="sprawy/polecenia" element={<ReferralsPage />} />
          <Route path="konsultacje" element={<BookingsPage />} />
          <Route path="konsultacje/zapytania" element={<RequestsPage />} />
          <Route path="wiadomosci" element={<ConversationsPage />} />
          <Route path="konto" element={<AccountPage />} />
        </Route>
        <Route path="sprawy/polecenia/nowe" element={<NewReferralPage />} />
        <Route path="sprawy/:id" element={<CaseDetailPage />} />
        <Route path="sprawy/:id/oferta" element={<OfferFormPage />} />
        <Route path="konsultacje/zapytania/:id" element={<RequestDetailPage />} />
        <Route path="wiadomosci/:id" element={<ChatPage />} />
        <Route path="konto/punkty" element={<PointsPage />} />
        <Route path="konto/pakiet" element={<PackagePage />} />
        <Route path="konto/platnosci" element={<BillingPage />} />
        <Route path="konto/faktury" element={<InvoicesPage />} />
        <Route path="konto/ustawienia" element={<SettingsPage />} />
        <Route path="konto/zamowienie" element={<CheckoutPage />} />
        <Route path="konto/zamowienie/:id" element={<OrderStatusPage />} />
        <Route path="*" element={<Navigate to={HOME} replace />} />
      </Routes>
    </>
  )
}
