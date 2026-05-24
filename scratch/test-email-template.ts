import { getBrandEmailLayout } from '../lib/email'

function test() {
  const content = `
    <h1>Witaj Jan Kowalski!</h1>
    <p>Dziękujemy za rejestrację w portalu. Twój link weryfikacyjny: <a href="https://example.com">Zweryfikuj</a></p>
  `
  const subject = "Zweryfikuj swój adres e-mail"
  
  const result = getBrandEmailLayout(content, subject)
  
  console.log("=== Czy HTML zawiera wstawioną treść? ===")
  console.log(result.includes("Witaj Jan Kowalski!") ? "TAK" : "NIE")
  
  console.log("\n=== Czy HTML zawiera poprawny preheader? ===")
  console.log(result.includes("Zweryfikuj swój adres e-mail") ? "TAK" : "NIE")

  console.log("\n=== Czy linki zostały podmienione? ===")
  console.log("Client Portal:", result.includes("/panel-klienta") ? "TAK" : "NIE")
  console.log("Terms of Service:", result.includes("/terms") ? "TAK" : "NIE")
  console.log("Privacy Policy:", result.includes("/privacy") ? "TAK" : "NIE")
  console.log("Cookie Settings:", result.includes("/cookies") ? "TAK" : "NIE")
  
  console.log("\n=== Pierwsze 100 znaków wygenerowanego maila ===")
  console.log(result.slice(0, 300))
}

test()
