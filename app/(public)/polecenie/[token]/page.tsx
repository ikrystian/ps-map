import { Metadata } from "next"
import ReferralLandingClientPage from "./ReferralLandingClientPage"

export const metadata: Metadata = {
  title: "Polecenie sprawy od eksperta",
  description:
    "Ekspert Prosta Sprawa przygotował dla Ciebie zgłoszenie sprawy. Załóż konto i dokończ zgłoszenie w kilka minut.",
  robots: { index: false, follow: false },
}

export default async function ReferralLandingPage({
  params,
}: {
  params: Promise<{ token: string }>
}) {
  const { token } = await params
  return <ReferralLandingClientPage token={token} />
}
