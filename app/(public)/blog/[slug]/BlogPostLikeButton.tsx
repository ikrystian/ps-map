"use client";

import { Button } from "@/components/ui/button";
import { ThumbsUp } from "lucide-react";
import { useEffect, useState } from "react";

interface LikeState {
  count: number;
  liked: boolean;
}

/**
 * Polecenie wpisu (jak „lubię to"). Strona wpisu jest cache'owana, więc liczba poleceń
 * i informacja, czy czytelnik już polecił wpis (po koncie lub IP), są pobierane po stronie klienta.
 */
export function BlogPostLikeButton({ slug }: { slug: string }) {
  const [state, setState] = useState<LikeState | null>(null);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/blog/posts/${slug}/like`)
      .then((response) => (response.ok ? response.json() : Promise.reject()))
      .then((data: LikeState) => {
        if (!cancelled) setState(data);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [slug]);

  const toggle = async () => {
    if (pending) return;
    const previous = state;
    const nextLiked = !previous?.liked;

    // Optymistyczna aktualizacja — cofana, gdy zapis się nie powiedzie
    setPending(true);
    setError(false);
    setState({ liked: nextLiked, count: Math.max(0, (previous?.count ?? 0) + (nextLiked ? 1 : -1)) });

    try {
      const response = await fetch(`/api/blog/posts/${slug}/like`, { method: nextLiked ? "POST" : "DELETE" });
      if (!response.ok) throw new Error();
      setState(await response.json());
    } catch {
      setState(previous);
      setError(true);
    } finally {
      setPending(false);
    }
  };

  const liked = state?.liked ?? false;

  return (
    <div className="mt-10 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-border/50 bg-muted/40 p-5">
      <div>
        <p className="font-semibold text-foreground">Czy ten artykuł był pomocny?</p>
        <p className="text-sm text-muted-foreground" aria-live="polite">
          {error ? "Nie udało się zapisać polecenia. Spróbuj ponownie." : "Poleć go innym czytelnikom."}
        </p>
      </div>
      <Button
        type="button"
        variant={liked ? "default" : "outline"}
        onClick={toggle}
        disabled={pending}
        aria-pressed={liked}
        aria-label={`${liked ? "Cofnij polecenie artykułu" : "Poleć artykuł"}${state ? `. Liczba poleceń: ${state.count}` : ""}`}
        className="gap-2 rounded-full px-5"
      >
        <ThumbsUp className={`h-4 w-4 ${liked ? "fill-current" : ""}`} />
        {liked ? "Polecasz" : "Poleć"}
        {state && (
          <span className="ml-1 rounded-full bg-foreground/10 px-2 py-0.5 text-xs font-semibold tabular-nums">
            {state.count}
          </span>
        )}
      </Button>
    </div>
  );
}
