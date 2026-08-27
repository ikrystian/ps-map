"use client"

import { Checkbox } from "@/components/ui/checkbox"
import { DatePicker } from "@/components/ui/date-picker"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { AnimatePresence, motion } from "framer-motion"
import { Sparkles } from "lucide-react"

type ScheduleBudgetField =
  | "oczekiwanyTerminRealizacji"
  | "trybPilny"
  | "budzetOd"
  | "budzetDo"
  | "doNegocjacji"

interface CaseScheduleBudgetStepProps {
  oczekiwanyTerminRealizacji: string
  trybPilny: boolean
  budzetOd: string
  budzetDo: string
  doNegocjacji: boolean
  onChange: (field: ScheduleBudgetField, value: string | boolean) => void
}

export function CaseScheduleBudgetStep({
  oczekiwanyTerminRealizacji,
  trybPilny,
  budzetOd,
  budzetDo,
  doNegocjacji,
  onChange,
}: CaseScheduleBudgetStepProps) {
  return (
    <div className="space-y-5">
      <div>
        <Label
          htmlFor="oczekiwanyTerminRealizacji"
          className="text-muted-foreground text-xs font-semibold mb-1.5 block"
        >
          Oczekiwany termin realizacji (opcjonalnie)
        </Label>
        <DatePicker
          id="oczekiwanyTerminRealizacji"
          value={oczekiwanyTerminRealizacji}
          onChange={(val) => onChange("oczekiwanyTerminRealizacji", val)}
          placeholder="Wybierz oczekiwany termin..."
          minDate={new Date()}
        />
      </div>

      <div className="flex items-center space-x-3 py-1.5">
        <Checkbox
          id="trybPilny"
          checked={trybPilny}
          onCheckedChange={(checked) => onChange("trybPilny", !!checked)}
          className="h-5 w-5 border-border/50 text-primary focus:ring-primary/30 data-[state=checked]:bg-primary data-[state=checked]:border-transparent rounded"
        />
        <Label
          htmlFor="trybPilny"
          className="cursor-pointer text-sm text-muted-foreground font-medium"
        >
          Sprawa pilna - wymaga natychmiastowej interwencji
        </Label>
      </div>

      <div className="rounded-lg border border-border/20 bg-background-sec/10 p-4 space-y-4">
        <div className="flex items-center justify-between gap-4">
          <div className="space-y-0.5">
            <Label
              htmlFor="doNegocjacji"
              className="cursor-pointer text-sm font-semibold text-foreground block"
            >
              Budżet pozostawiam do negocjacji z ekspertem
            </Label>
            <p className="text-xs text-muted-foreground font-light">
              Włącz tę opcję, jeśli chcesz otrzymać propozycje wyceny bezpośrednio od ekspertów.
            </p>
          </div>
          <Switch
            id="doNegocjacji"
            checked={doNegocjacji}
            onCheckedChange={(checked) => {
              onChange("doNegocjacji", checked)
              if (checked) {
                onChange("budzetOd", "")
                onChange("budzetDo", "")
              }
            }}
          />
        </div>

        <AnimatePresence>
          {!doNegocjacji && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.25, ease: "easeInOut" }}
              className="overflow-hidden pt-3 border-t border-border/10"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label
                    htmlFor="budzetOd"
                    className="text-muted-foreground text-xs font-semibold block mb-1.5"
                  >
                    Szacowany budżet od (PLN)
                  </Label>
                  <Input
                    id="budzetOd"
                    type="number"
                    min="0"
                    step="0.01"
                    value={budzetOd}
                    onChange={(e) => onChange("budzetOd", e.target.value)}
                    placeholder="0.00"
                    className="h-11"
                  />
                </div>
                <div>
                  <Label
                    htmlFor="budzetDo"
                    className="text-muted-foreground text-xs font-semibold block mb-1.5"
                  >
                    Szacowany budżet do (PLN)
                  </Label>
                  <Input
                    id="budzetDo"
                    type="number"
                    min="0"
                    step="0.01"
                    value={budzetDo}
                    onChange={(e) => onChange("budzetDo", e.target.value)}
                    placeholder="0.00"
                    className="h-11"
                  />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="rounded-lg border border-primary/20 bg-primary/5 p-4 mt-6 flex items-start gap-3">
        <Sparkles className="h-5 w-5 text-primary shrink-0 mt-0.5" />
        <div className="space-y-0.5">
          <h5 className="text-xs font-semibold text-primary uppercase tracking-wider">
            Wskazówka
          </h5>
          <p className="text-xs text-muted-foreground leading-relaxed font-light">
            Określenie zakresu finansowego pozwala ekspertom dopasować wycenę do
            Twoich możliwości. Jeśli nie znasz szacowanego kosztu, zostaw opcję
            budżetu do negocjacji włączoną.
          </p>
        </div>
      </div>
    </div>
  )
}
