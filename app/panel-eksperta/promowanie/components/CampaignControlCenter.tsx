"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"
import {
  TrendingUp,
  Info,
  MoreVertical,
  RefreshCw,
  Trash2,
  Coins,
} from "lucide-react"
import { Promotion } from "../types"
import {
  getPromotionTypeLabel,
  getPromotionStatusBadge,
  formatDate,
} from "../utils"

interface CampaignControlCenterProps {
  activePromotions: Promotion[]
  upcomingPromotions: Promotion[]
  pastPromotions: Promotion[]
  promotionTypes: any[]
  handleToggleAutoRenewal: (promotion: Promotion) => void
  openCancelDialog: (promotion: Promotion) => void
}

export function CampaignControlCenter({
  activePromotions,
  upcomingPromotions,
  pastPromotions,
  promotionTypes,
  handleToggleAutoRenewal,
  openCancelDialog,
}: CampaignControlCenterProps) {
  return (
    <div id="tour-promo-list" className="space-y-6 relative z-10">
      <div className="space-y-1">
        <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-[#0da192]" />
          Panel Kontrolny Kampanii
        </h2>
        <p className="text-xs text-muted-foreground">
          Monitoruj i kontroluj aktywność swoich aktywnych, zaplanowanych oraz archiwalnych promowań.
        </p>
      </div>

      <Tabs defaultValue="active" className="w-full">
        <TabsList className="grid w-full grid-cols-3 bg-[#20201d]/60 border border-[#3e3e38] rounded-xl p-1 max-w-md">
          <TabsTrigger
            value="active"
            className="rounded-lg text-xs font-semibold data-[state=active]:bg-[#0da192] data-[state=active]:text-white transition-all py-2"
          >
            Aktywne ({activePromotions.length})
          </TabsTrigger>
          <TabsTrigger
            value="upcoming"
            className="rounded-lg text-xs font-semibold data-[state=active]:bg-[#0da192] data-[state=active]:text-white transition-all py-2"
          >
            Zaplanowane ({upcomingPromotions.length})
          </TabsTrigger>
          <TabsTrigger
            value="past"
            className="rounded-lg text-xs font-semibold data-[state=active]:bg-[#0da192] data-[state=active]:text-white transition-all py-2"
          >
            Archiwalne ({pastPromotions.length})
          </TabsTrigger>
        </TabsList>

        {/* Active Promotions Tab */}
        <TabsContent value="active" className="mt-4">
          {activePromotions.length === 0 ? (
            <Card className="border-[#3e3e38] bg-[#363431]/20">
              <CardContent className="py-16 text-center space-y-4">
                <div className="w-12 h-12 rounded-full bg-[#3e3e38]/50 flex items-center justify-center mx-auto">
                  <Info className="h-5 w-5 text-muted-foreground" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-sm font-semibold text-white">Brak aktywnych kampanii</h4>
                  <p className="text-xs text-muted-foreground max-w-xs mx-auto">
                    Twoja kancelaria nie ma obecnie uruchomionych promowań. Wybierz format powyżej, aby zacząć.
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="border-[#3e3e38] bg-[#363431]/20 rounded-2xl overflow-hidden shadow-xl">
              {/* Desktop View */}
              <div className="hidden md:block">
                <Table>
                  <TableHeader className="bg-[#20201d]/60 border-b border-[#3e3e38]/60">
                    <TableRow className="hover:bg-transparent">
                      <TableHead className="text-xs font-semibold tracking-wider text-muted-foreground uppercase py-4">Format promowania</TableHead>
                      <TableHead className="text-xs font-semibold tracking-wider text-muted-foreground uppercase py-4">Zasięg / Parametr</TableHead>
                      <TableHead className="text-xs font-semibold tracking-wider text-muted-foreground uppercase py-4">Data rozpoczęcia</TableHead>
                      <TableHead className="text-xs font-semibold tracking-wider text-muted-foreground uppercase py-4">Koniec ważności</TableHead>
                      <TableHead className="text-xs font-semibold tracking-wider text-muted-foreground uppercase text-right py-4">Koszt</TableHead>
                      <TableHead className="text-xs font-semibold tracking-wider text-muted-foreground uppercase py-4">Status</TableHead>
                      <TableHead className="text-xs font-semibold tracking-wider text-muted-foreground uppercase text-right py-4">Zarządzaj</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {activePromotions.map((promo) => (
                      <TableRow key={promo.id} className="hover:bg-[#363431]/40 border-b border-[#3e3e38]/30 transition-colors">
                        <TableCell className="font-bold text-sm text-white py-4">
                          {getPromotionTypeLabel(promo.typPromocji, promotionTypes)}
                        </TableCell>
                        <TableCell className="text-xs text-[#b7b5a9]">
                          {promo.kategoriaPromocji || promo.wojewodztwoPromocji || "Cały serwis"}
                        </TableCell>
                        <TableCell className="text-xs text-[#b7b5a9]">{formatDate(promo.startPromocji)}</TableCell>
                        <TableCell className="text-xs text-[#b7b5a9]">{formatDate(promo.koniecPromocji)}</TableCell>
                        <TableCell className="text-right font-semibold text-sm text-[#d7b56d] py-4">
                          {promo.kosztPunktow} pkt
                        </TableCell>
                        <TableCell className="py-4">{getPromotionStatusBadge(promo)}</TableCell>
                        <TableCell className="text-right py-4">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0 border border-[#3e3e38] bg-[#363431]/50 hover:bg-[#363431] text-muted-foreground hover:text-white rounded-lg">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="bg-[#30302e] border-[#3e3e38] text-[#e5e5e2]">
                              <DropdownMenuItem
                                onClick={() => handleToggleAutoRenewal(promo)}
                                className="gap-2 focus:bg-[#3e3e38] focus:text-white cursor-pointer text-xs py-2"
                              >
                                <RefreshCw className="h-3.5 w-3.5" />
                                {promo.automatyczneOdnowienie
                                  ? "Wyłącz auto-odnowienie"
                                  : "Włącz auto-odnowienie"}
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => openCancelDialog(promo)}
                                className="gap-2 text-destructive focus:bg-red-500/10 focus:text-red-400 cursor-pointer text-xs py-2"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                                Anuluj promocję
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Mobile View */}
              <div className="block md:hidden p-4 space-y-4">
                {activePromotions.map((promo) => (
                  <div key={promo.id} className="p-4 rounded-xl border border-[#3e3e38]/80 bg-[#363431]/10 space-y-3">
                    <div className="flex justify-between items-start">
                      <div className="space-y-1">
                        <div className="font-bold text-white text-sm">
                          {getPromotionTypeLabel(promo.typPromocji, promotionTypes)}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {promo.kategoriaPromocji || promo.wojewodztwoPromocji || "Cały serwis"}
                        </div>
                      </div>
                      {getPromotionStatusBadge(promo)}
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-[11px] py-2.5 border-y border-[#3e3e38]/40">
                      <div>
                        <span className="text-muted-foreground block text-sm uppercase font-semibold">Start</span>
                        <span className="text-[#faf9f5] font-medium">{formatDate(promo.startPromocji)}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground block text-sm uppercase font-semibold">Koniec</span>
                        <span className="text-[#faf9f5] font-medium">{formatDate(promo.koniecPromocji)}</span>
                      </div>
                    </div>

                    <div className="flex justify-between items-center pt-1">
                      <span className="text-xs font-semibold text-[#d7b56d] flex items-center gap-1">
                        <Coins className="h-3.5 w-3.5" />
                        {promo.kosztPunktow} pkt
                      </span>

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 px-2 border border-[#3e3e38] bg-[#363431]/50 hover:bg-[#363431] text-xs font-medium gap-1 text-muted-foreground hover:text-white rounded-lg">
                            Zarządzaj
                            <MoreVertical className="h-3 w-3" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-[#30302e] border-[#3e3e38] text-[#e5e5e2]">
                          <DropdownMenuItem
                            onClick={() => handleToggleAutoRenewal(promo)}
                            className="gap-2 focus:bg-[#3e3e38] focus:text-white cursor-pointer text-xs py-2"
                          >
                            <RefreshCw className="h-3.5 w-3.5" />
                            {promo.automatyczneOdnowienie
                              ? "Wyłącz auto-odnowienie"
                              : "Włącz auto-odnowienie"}
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => openCancelDialog(promo)}
                            className="gap-2 text-destructive focus:bg-red-500/10 focus:text-red-400 cursor-pointer text-xs py-2"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                            Anuluj promocję
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </TabsContent>

        {/* Upcoming Promotions Tab */}
        <TabsContent value="upcoming" className="mt-4">
          {upcomingPromotions.length === 0 ? (
            <Card className="border-[#3e3e38] bg-[#363431]/20">
              <CardContent className="py-16 text-center space-y-4">
                <div className="w-12 h-12 rounded-full bg-[#3e3e38]/50 flex items-center justify-center mx-auto">
                  <Info className="h-5 w-5 text-muted-foreground" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-sm font-semibold text-white">Brak zaplanowanych kampanii</h4>
                  <p className="text-xs text-muted-foreground max-w-xs mx-auto">
                    Nie masz obecnie żadnych oczekujących na start lub zaplanowanych promowań.
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="border-[#3e3e38] bg-[#363431]/20 rounded-2xl overflow-hidden shadow-xl">
              {/* Desktop View */}
              <div className="hidden md:block">
                <Table>
                  <TableHeader className="bg-[#20201d]/60 border-b border-[#3e3e38]/60">
                    <TableRow className="hover:bg-transparent">
                      <TableHead className="text-xs font-semibold tracking-wider text-muted-foreground uppercase py-4">Format promowania</TableHead>
                      <TableHead className="text-xs font-semibold tracking-wider text-muted-foreground uppercase py-4">Zasięg / Parametr</TableHead>
                      <TableHead className="text-xs font-semibold tracking-wider text-muted-foreground uppercase py-4">Data rozpoczęcia</TableHead>
                      <TableHead className="text-xs font-semibold tracking-wider text-muted-foreground uppercase py-4">Koniec ważności</TableHead>
                      <TableHead className="text-xs font-semibold tracking-wider text-muted-foreground uppercase text-right py-4">Koszt</TableHead>
                      <TableHead className="text-xs font-semibold tracking-wider text-muted-foreground uppercase py-4">Status</TableHead>
                      <TableHead className="text-xs font-semibold tracking-wider text-muted-foreground uppercase text-right py-4">Zarządzaj</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {upcomingPromotions.map((promo) => (
                      <TableRow key={promo.id} className="hover:bg-[#363431]/40 border-b border-[#3e3e38]/30 transition-colors">
                        <TableCell className="font-bold text-sm text-white py-4">
                          {getPromotionTypeLabel(promo.typPromocji, promotionTypes)}
                        </TableCell>
                        <TableCell className="text-xs text-[#b7b5a9]">
                          {promo.kategoriaPromocji || promo.wojewodztwoPromocji || "Cały serwis"}
                        </TableCell>
                        <TableCell className="text-xs text-[#b7b5a9]">{formatDate(promo.startPromocji)}</TableCell>
                        <TableCell className="text-xs text-[#b7b5a9]">{formatDate(promo.koniecPromocji)}</TableCell>
                        <TableCell className="text-right font-semibold text-sm text-[#d7b56d] py-4">
                          {promo.kosztPunktow} pkt
                        </TableCell>
                        <TableCell className="py-4">{getPromotionStatusBadge(promo)}</TableCell>
                        <TableCell className="text-right py-4">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0 border border-[#3e3e38] bg-[#363431]/50 hover:bg-[#363431] text-muted-foreground hover:text-white rounded-lg">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="bg-[#30302e] border-[#3e3e38] text-[#e5e5e2]">
                              <DropdownMenuItem
                                onClick={() => handleToggleAutoRenewal(promo)}
                                className="gap-2 focus:bg-[#3e3e38] focus:text-white cursor-pointer text-xs py-2"
                              >
                                <RefreshCw className="h-3.5 w-3.5" />
                                {promo.automatyczneOdnowienie
                                  ? "Wyłącz auto-odnowienie"
                                  : "Włącz auto-odnowienie"}
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => openCancelDialog(promo)}
                                className="gap-2 text-destructive focus:bg-red-500/10 focus:text-red-400 cursor-pointer text-xs py-2"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                                Anuluj promocję
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Mobile View */}
              <div className="block md:hidden p-4 space-y-4">
                {upcomingPromotions.map((promo) => (
                  <div key={promo.id} className="p-4 rounded-xl border border-[#3e3e38]/80 bg-[#363431]/10 space-y-3">
                    <div className="flex justify-between items-start">
                      <div className="space-y-1">
                        <div className="font-bold text-white text-sm">
                          {getPromotionTypeLabel(promo.typPromocji, promotionTypes)}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {promo.kategoriaPromocji || promo.wojewodztwoPromocji || "Cały serwis"}
                        </div>
                      </div>
                      {getPromotionStatusBadge(promo)}
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-[11px] py-2.5 border-y border-[#3e3e38]/40">
                      <div>
                        <span className="text-muted-foreground block text-sm uppercase font-semibold">Start</span>
                        <span className="text-[#faf9f5] font-medium">{formatDate(promo.startPromocji)}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground block text-sm uppercase font-semibold">Koniec</span>
                        <span className="text-[#faf9f5] font-medium">{formatDate(promo.koniecPromocji)}</span>
                      </div>
                    </div>

                    <div className="flex justify-between items-center pt-1">
                      <span className="text-xs font-semibold text-[#d7b56d] flex items-center gap-1">
                        <Coins className="h-3.5 w-3.5" />
                        {promo.kosztPunktow} pkt
                      </span>

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 px-2 border border-[#3e3e38] bg-[#363431]/50 hover:bg-[#363431] text-xs font-medium gap-1 text-muted-foreground hover:text-white rounded-lg">
                            Zarządzaj
                            <MoreVertical className="h-3 w-3" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-[#30302e] border-[#3e3e38] text-[#e5e5e2]">
                          <DropdownMenuItem
                            onClick={() => handleToggleAutoRenewal(promo)}
                            className="gap-2 focus:bg-[#3e3e38] focus:text-white cursor-pointer text-xs py-2"
                          >
                            <RefreshCw className="h-3.5 w-3.5" />
                            {promo.automatyczneOdnowienie
                              ? "Wyłącz auto-odnowienie"
                              : "Włącz auto-odnowienie"}
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => openCancelDialog(promo)}
                            className="gap-2 text-destructive focus:bg-red-500/10 focus:text-red-400 cursor-pointer text-xs py-2"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                            Anuluj promocję
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </TabsContent>

        {/* Archiwalne / Past Promotions Tab */}
        <TabsContent value="past" className="mt-4">
          {pastPromotions.length === 0 ? (
            <Card className="border-[#3e3e38] bg-[#363431]/20">
              <CardContent className="py-16 text-center space-y-4">
                <div className="w-12 h-12 rounded-full bg-[#3e3e38]/50 flex items-center justify-center mx-auto">
                  <Info className="h-5 w-5 text-muted-foreground" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-sm font-semibold text-white">Brak historii kampanii</h4>
                  <p className="text-xs text-muted-foreground max-w-xs mx-auto">
                    Nie posiadasz jeszcze zakończonych kampanii w tym portalu.
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="border-[#3e3e38] bg-[#363431]/20 rounded-2xl overflow-hidden shadow-xl">
              {/* Desktop View */}
              <div className="hidden md:block">
                <Table>
                  <TableHeader className="bg-[#20201d]/60 border-b border-[#3e3e38]/60">
                    <TableRow className="hover:bg-transparent">
                      <TableHead className="text-xs font-semibold tracking-wider text-muted-foreground uppercase py-4">Format promowania</TableHead>
                      <TableHead className="text-xs font-semibold tracking-wider text-muted-foreground uppercase py-4">Zasięg / Parametr</TableHead>
                      <TableHead className="text-xs font-semibold tracking-wider text-muted-foreground uppercase py-4">Data rozpoczęcia</TableHead>
                      <TableHead className="text-xs font-semibold tracking-wider text-muted-foreground uppercase py-4">Koniec ważności</TableHead>
                      <TableHead className="text-xs font-semibold tracking-wider text-muted-foreground uppercase text-right py-4">Koszt</TableHead>
                      <TableHead className="text-xs font-semibold tracking-wider text-muted-foreground uppercase py-4">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pastPromotions.map((promo) => (
                      <TableRow key={promo.id} className="hover:bg-[#363431]/40 border-b border-[#3e3e38]/30 transition-colors">
                        <TableCell className="font-bold text-sm text-white py-4">
                          {getPromotionTypeLabel(promo.typPromocji, promotionTypes)}
                        </TableCell>
                        <TableCell className="text-xs text-[#b7b5a9]">
                          {promo.kategoriaPromocji || promo.wojewodztwoPromocji || "Cały serwis"}
                        </TableCell>
                        <TableCell className="text-xs text-[#b7b5a9]">{formatDate(promo.startPromocji)}</TableCell>
                        <TableCell className="text-xs text-[#b7b5a9]">{formatDate(promo.koniecPromocji)}</TableCell>
                        <TableCell className="text-right font-semibold text-sm text-[#d7b56d] py-4">
                          {promo.kosztPunktow} pkt
                        </TableCell>
                        <TableCell className="py-4">{getPromotionStatusBadge(promo)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Mobile View */}
              <div className="block md:hidden p-4 space-y-4">
                {pastPromotions.map((promo) => (
                  <div key={promo.id} className="p-4 rounded-xl border border-[#3e3e38]/80 bg-[#363431]/10 space-y-3 opacity-75">
                    <div className="flex justify-between items-start">
                      <div className="space-y-1">
                        <div className="font-bold text-white text-sm">
                          {getPromotionTypeLabel(promo.typPromocji, promotionTypes)}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {promo.kategoriaPromocji || promo.wojewodztwoPromocji || "Cały serwis"}
                        </div>
                      </div>
                      {getPromotionStatusBadge(promo)}
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-[11px] py-2.5 border-y border-[#3e3e38]/40">
                      <div>
                        <span className="text-muted-foreground block text-sm uppercase font-semibold">Start</span>
                        <span className="text-[#faf9f5] font-medium">{formatDate(promo.startPromocji)}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground block text-sm uppercase font-semibold">Koniec</span>
                        <span className="text-[#faf9f5] font-medium">{formatDate(promo.koniecPromocji)}</span>
                      </div>
                    </div>

                    <div className="pt-1 flex justify-between items-center">
                      <span className="text-xs font-semibold text-muted-foreground flex items-center gap-1">
                        <Coins className="h-3.5 w-3.5" />
                        {promo.kosztPunktow} pkt
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
