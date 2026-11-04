import { CircleAlert } from "lucide-react"
import { Component, type ReactNode } from "react"
import { Button } from "./ui"

/** Ostatnia linia obrony: błąd renderowania zamiast białego ekranu pokazuje drogę wyjścia. */
export class ErrorBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false }

  static getDerivedStateFromError() {
    return { failed: true }
  }

  componentDidCatch(error: unknown) {
    console.error(error)
  }

  render() {
    if (!this.state.failed) return this.props.children

    return (
      <div className="flex h-full flex-col items-center justify-center gap-4 px-8 text-center">
        <span className="flex size-16 items-center justify-center rounded-full bg-destructive/10">
          <CircleAlert className="size-8 text-destructive" aria-hidden />
        </span>
        <div>
          <h1 className="font-serif text-xl font-semibold">Coś poszło nie tak</h1>
          <p className="mt-1 text-sm text-muted-foreground">Uruchom aplikację ponownie. Twoje dane są bezpieczne.</p>
        </div>
        <Button onClick={() => window.location.replace("/")}>Uruchom ponownie</Button>
      </div>
    )
  }
}
