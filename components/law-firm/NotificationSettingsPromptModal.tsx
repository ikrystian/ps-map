/**
 * Komponent NotificationSettingsPromptModal
 *
 * Wyświetla się podczas pierwszego zalogowania eksperta,
 * prosząc o uzupełnienie preferencji powiadomień.
 */

"use client";

import { useState, useEffect } from "react";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/sonner";
import { Bell, Mail, MessageSquare, ShieldAlert, Loader2, Save, Sparkles, Smartphone, Check } from "lucide-react";

interface NotificationSettings {
  emailNoweOferty: boolean;
  emailWiadomosci: boolean;
  emailStatusy: boolean;
  smsPilne: boolean;
  kontaktKlienci: boolean;
  kluczowe: boolean;
  wskazowkiPorady: boolean;
  ofertPromocje: boolean;
  przypomnienieWiadomosci: boolean;
  noweFunkcje: boolean;
  zmianyCenniki: boolean;
  zmianyRegulamin: boolean;
  kontaktDoradca: boolean;
  wyswietlanieAwatara: boolean;
  autoProsbOpinie: boolean;
  powiadomienieDzwiekowe: boolean;
  ustawieniaOgloszenia: boolean;
  powiadomieniaSmNowa: boolean;
  wiadomosciZbiorcze: boolean;
  urlop: boolean;
}

interface NotificationSettingsPromptModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function NotificationSettingsPromptModal({
  open,
  onOpenChange,
  onSuccess,
}: NotificationSettingsPromptModalProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [settings, setSettings] = useState<NotificationSettings>({
    emailNoweOferty: true,
    emailWiadomosci: true,
    emailStatusy: true,
    smsPilne: false,
    kontaktKlienci: true,
    kluczowe: true,
    wskazowkiPorady: true,
    ofertPromocje: true,
    przypomnienieWiadomosci: true,
    noweFunkcje: true,
    zmianyCenniki: true,
    zmianyRegulamin: true,
    kontaktDoradca: false,
    wyswietlanieAwatara: true,
    autoProsbOpinie: false,
    powiadomienieDzwiekowe: false,
    ustawieniaOgloszenia: true,
    powiadomieniaSmNowa: false,
    wiadomosciZbiorcze: true,
    urlop: false,
  });

  useEffect(() => {
    if (!open) return;

    const fetchSettings = async () => {
      try {
        const res = await fetch("/api/notification-settings");
        if (res.ok) {
          const data = await res.json();
          setSettings((prev) => ({ ...prev, ...data }));
        }
      } catch (error) {
        console.error("Error fetching notification settings in modal:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSettings();
  }, [open]);

  const handleToggle = (key: keyof NotificationSettings) => {
    // Nie pozwól na zmianę obowiązkowych pól
    if (key === "kontaktKlienci" || key === "kluczowe") {
      toast.error("To ustawienie jest wymagane do prawidłowego działania konta.");
      return;
    }
    setSettings((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSave = async (useDefaults = false) => {
    setIsSaving(true);
    const dataToSave = useDefaults
      ? {
        ...settings,
        emailNoweOferty: true,
        emailWiadomosci: true,
        emailStatusy: true,
        wskazowkiPorady: true,
        ofertPromocje: true,
        isConfigured: true,
      }
      : {
        ...settings,
        isConfigured: true,
      };

    try {
      const res = await fetch("/api/notification-settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dataToSave),
      });

      if (res.ok) {
        toast.success("Preferencje powiadomień zostały zapisane!");
        onSuccess();
        onOpenChange(false);
      } else {
        throw new Error("Failed to save settings");
      }
    } catch (error) {
      console.error("Error saving settings from modal:", error);
      toast.error("Nie udało się zapisać ustawień. Spróbuj ponownie.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-xl border border-border bg-background p-6 shadow-2xl backdrop-blur-xl md:p-8">
        <AlertDialogHeader className="space-y-4">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-primary to-primary/80 shadow-lg shadow-primary/20">
            <Bell className="h-7 w-7 text-primary-foreground animate-pulse" />
          </div>

          <AlertDialogTitle className="text-center text-2xl font-bold tracking-tight text-foreground md:text-3xl">
            Witaj w Panelu Eksperta!
          </AlertDialogTitle>

          <AlertDialogDescription className="text-center text-sm text-muted-foreground md:text-base max-w-md mx-auto">
            Zanim rozpoczniesz, dostosuj preferencje powiadomień, aby nie ominęły Cię żadne zlecenia i wiadomości od klientów.
          </AlertDialogDescription>
        </AlertDialogHeader>

        {isLoading ? (
          <div className="flex h-48 items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="my-6 space-y-4 max-h-[350px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-border">
            {/* Sekcja Powiadomienia e-mail */}
            <div className="space-y-3">
              <h4 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-primary">
                <Mail className="h-3.5 w-3.5" /> Powiadomienia e-mail
              </h4>

              {/* Nowe oferty */}
              <div className="flex items-start justify-between gap-4 rounded-xl border border-border bg-muted/20 p-3.5 transition-all hover:bg-muted/40">
                <div className="space-y-1">
                  <Label htmlFor="modal-emailNoweOferty" className="cursor-pointer text-sm font-medium text-foreground">
                    Nowe oferty spraw
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Otrzymuj wiadomości e-mail o nowych sprawach pasujących do Twojej specjalizacji.
                  </p>
                </div>
                <Switch
                  id="modal-emailNoweOferty"
                  checked={settings.emailNoweOferty}
                  onCheckedChange={() => handleToggle("emailNoweOferty")}
                  className="data-[state=checked]:bg-primary"
                />
              </div>

              {/* Nowe wiadomości */}
              <div className="flex items-start justify-between gap-4 rounded-xl border border-border bg-muted/20 p-3.5 transition-all hover:bg-muted/40">
                <div className="space-y-1">
                  <Label htmlFor="modal-emailWiadomosci" className="cursor-pointer text-sm font-medium text-foreground">
                    Nowe wiadomości na czacie
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Otrzymuj e-maile, gdy klient wyśle nową wiadomość w sprawie.
                  </p>
                </div>
                <Switch
                  id="modal-emailWiadomosci"
                  checked={settings.emailWiadomosci}
                  onCheckedChange={() => handleToggle("emailWiadomosci")}
                  className="data-[state=checked]:bg-primary"
                />
              </div>

              {/* Statusy */}
              <div className="flex items-start justify-between gap-4 rounded-xl border border-border bg-muted/20 p-3.5 transition-all hover:bg-muted/40">
                <div className="space-y-1">
                  <Label htmlFor="modal-emailStatusy" className="cursor-pointer text-sm font-medium text-foreground">
                    Zmiany statusów spraw i konsultacji
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Powiadomienia o akceptacji oferty, opłaceniu lub anulowaniu konsultacji.
                  </p>
                </div>
                <Switch
                  id="modal-emailStatusy"
                  checked={settings.emailStatusy}
                  onCheckedChange={() => handleToggle("emailStatusy")}
                  className="data-[state=checked]:bg-primary"
                />
              </div>
            </div>

            {/* Sekcja Powiadomienia SMS */}
            <div className="space-y-3 pt-2">
              <h4 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-primary">
                <Smartphone className="h-3.5 w-3.5" /> Powiadomienia SMS (Pilne)
              </h4>

              {/* SMS Pilne */}
              <div className="flex items-start justify-between gap-4 rounded-xl border border-border bg-muted/20 p-3.5 transition-all hover:bg-muted/40">
                <div className="space-y-1">
                  <Label htmlFor="modal-smsPilne" className="cursor-pointer text-sm font-medium text-foreground">
                    Pilne powiadomienia SMS
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Otrzymuj wiadomości SMS w sprawach wymagających natychmiastowej reakcji.
                  </p>
                </div>
                <Switch
                  id="modal-smsPilne"
                  checked={settings.smsPilne}
                  onCheckedChange={() => handleToggle("smsPilne")}
                  className="data-[state=checked]:bg-primary"
                />
              </div>

              {/* SMS Nowa Wiadomosc */}
              <div className="flex items-start justify-between gap-4 rounded-xl border border-border bg-muted/20 p-3.5 transition-all hover:bg-muted/40">
                <div className="space-y-1">
                  <Label htmlFor="modal-powiadomieniaSmNowa" className="cursor-pointer text-sm font-medium text-foreground">
                    SMS przy nowej wiadomości na czacie
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Dostawaj krótką wiadomość SMS, gdy klient odpisze w ważnej sprawie.
                  </p>
                </div>
                <Switch
                  id="modal-powiadomieniaSmNowa"
                  checked={settings.powiadomieniaSmNowa}
                  onCheckedChange={() => handleToggle("powiadomieniaSmNowa")}
                  className="data-[state=checked]:bg-primary"
                />
              </div>
            </div>

            {/* Powiadomienia obowiązkowe (informacyjnie) */}
            <div className="rounded-xl border border-dashed border-border bg-muted/20 p-3">
              <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <ShieldAlert className="h-3.5 w-3.5 text-amber-500/80" />
                Powiadomienia o kontaktach bezpośrednich oraz systemowe są domyślnie włączone jako obowiązkowe.
              </p>
            </div>
          </div>
        )}

        <AlertDialogFooter className="flex flex-col sm:flex-row gap-2.5 pt-4 border-t border-border">
          <Button
            variant="ghost"
            className="w-full text-muted-foreground hover:text-foreground hover:bg-muted/40 order-2 sm:order-1"
            onClick={() => handleSave(true)}
            disabled={isSaving || isLoading}
          >
            Użyj domyślnych
          </Button>

          <Button
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-medium shadow-lg shadow-primary/10 hover:shadow-primary/20 order-1 sm:order-2"
            onClick={() => handleSave(false)}
            disabled={isSaving || isLoading}
          >
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Zapisywanie...
              </>
            ) : (
              <>
                <Check className="mr-2 h-4 w-4" />
                Zapisz preferencje
              </>
            )}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
