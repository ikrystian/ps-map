"use client";

import { Button } from "@/components/ui/button";
import {
  Command,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Check, ChevronDown } from "lucide-react";
import { useEffect, useState } from "react";

interface CityOption {
  id: string;
  nazwa: string;
  voivodeship?: { slug: string; nazwa: string } | null;
  postalCodes?: { code: string }[];
}

/** Cache wyników wyszukiwania miast — współdzielony między instancjami komponentu. */
const clientCitiesCache: Record<string, CityOption[]> = {};

export interface SelectedCity {
  id: string;
  nazwa: string;
  /** Slug województwa — tego oczekuje `POST /api/cases` w polu `voivodeshipId`. */
  voivodeshipSlug: string;
  voivodeshipNazwa: string;
}

interface CityComboboxProps {
  /** Aktualnie wybrane `cityId` */
  value: string;
  /** Nazwa wybranego miasta do wyświetlenia na przycisku */
  cityName: string;
  onSelect: (city: SelectedCity) => void;
  hasError?: boolean;
  placeholder?: string;
  className?: string;
}

/**
 * Wyszukiwarka miast z podpowiedziami (debounce 300 ms, min. 2 znaki).
 * Zwraca też slug województwa, bo API spraw identyfikuje województwo po slugu.
 */
export function CityCombobox({
  value,
  cityName,
  onSelect,
  hasError,
  placeholder = "Wybierz miasto...",
  className,
}: CityComboboxProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [cities, setCities] = useState<CityOption[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const query = search.trim().toLowerCase();
  const isQueryTooShort = query.length < 2;

  // Trafienie w cache obsługujemy przy renderze (`visibleCities`), a wyniki dla zbyt
  // krótkiej frazy i tak nie są pokazywane — dlatego efekt tylko pobiera dane.
  useEffect(() => {
    if (isQueryTooShort || clientCitiesCache[query]) return;

    const controller = new AbortController();
    const timeoutId = setTimeout(async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`/api/cities?search=${encodeURIComponent(query)}`, {
          signal: controller.signal,
        });
        if (response.ok) {
          const data = await response.json();
          if (Array.isArray(data)) {
            clientCitiesCache[query] = data;
            setCities(data);
          }
        }
      } catch (error) {
        if (!(error instanceof Error) || error.name !== "AbortError") {
          console.error("Error fetching cities:", error);
        }
      } finally {
        setIsLoading(false);
      }
    }, 300);

    return () => {
      clearTimeout(timeoutId);
      controller.abort();
    };
  }, [query, isQueryTooShort]);

  const visibleCities = isQueryTooShort ? [] : (clientCitiesCache[query] ?? cities);

  const handleOpenChange = (next: boolean) => {
    setOpen(next);
    if (!next) setSearch("");
  };

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          className={cn(
            "h-11 w-full bg-background-sec/40 border-border/40 hover:border-primary/60 hover:bg-background-sec/60 focus:border-primary rounded-xl text-sm font-normal text-left justify-between mt-1.5 transition-all cursor-pointer shadow-xs",
            hasError ? "border-destructive focus-visible:ring-destructive" : "border-border/40",
            className,
          )}
        >
          <span className={cn("truncate", cityName ? "text-white font-medium" : "text-muted-foreground")}>
            {cityName || placeholder}
          </span>
          <ChevronDown className="ml-2 h-4 w-4 shrink-0 text-primary opacity-80" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-[var(--radix-popover-trigger-width)] max-w-[calc(100vw-2rem)] p-0 border-border/40"
        align="start"
      >
        <Command shouldFilter={false}>
          <CommandInput placeholder="Wyszukaj miasto..." value={search} onValueChange={setSearch} />
          <CommandList className="max-h-60 overflow-y-auto">
            {isQueryTooShort && (
              <div className="text-neutral-400 py-3 text-center text-xs px-3">
                Wpisz co najmniej 2 znaki...
              </div>
            )}
            {!isQueryTooShort && isLoading && (
              <div className="text-neutral-400 py-3 text-center text-xs">Wyszukiwanie...</div>
            )}
            {!isQueryTooShort && !isLoading && visibleCities.length === 0 && (
              <div className="text-neutral-400 py-3 text-center text-xs">Nie znaleziono miasta.</div>
            )}
            <CommandGroup>
              {visibleCities.map((city) => {
                const matchedPostal = city.postalCodes?.find((p) =>
                  p.code.toLowerCase().includes(query),
                );
                const displayValue = matchedPostal
                  ? `${city.nazwa} (${matchedPostal.code})`
                  : city.nazwa;

                return (
                  <CommandItem
                    key={city.id}
                    value={city.nazwa}
                    onSelect={() => {
                      onSelect({
                        id: city.id,
                        nazwa: city.nazwa,
                        voivodeshipSlug: city.voivodeship?.slug || "",
                        voivodeshipNazwa: city.voivodeship?.nazwa || "",
                      });
                      setOpen(false);
                    }}
                    className="cursor-pointer flex items-center justify-between gap-2 py-2.5 px-3 text-sm rounded-lg hover:bg-primary/15 hover:text-white data-[selected=true]:bg-primary/20 text-zinc-200 my-0.5 border border-transparent hover:border-primary/30 transition-all"
                  >
                    <div className="flex items-center gap-2">
                      <Check
                        className={cn(
                          "h-4 w-4 text-primary font-bold",
                          value === city.id ? "opacity-100" : "opacity-0",
                        )}
                      />
                      <span>{displayValue}</span>
                    </div>
                    <span className="text-xs text-muted-foreground ml-2 text-right">
                      {city.voivodeship?.nazwa}
                    </span>
                  </CommandItem>
                );
              })}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
