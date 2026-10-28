'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { toast } from '@/components/ui/sonner'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useDebounce } from '@/lib/hooks/use-debounce'
import { AlertTriangle, MapPin, Search, UserMinus, UserPlus } from 'lucide-react'
import { useEffect, useState } from 'react'

const NO_MANAGER = 'none'

interface ManagerSummary {
  id: string
  imie: string
  nazwisko: string
  email: string
  aktywny: boolean
  voivodeships: { id: string; nazwa: string }[]
}

interface ExpertRow {
  id: string
  nazwa: string
  aktywna: boolean
  email: string
  numerTelefonu: string
  miasto: string
  voivodeship: { id: string; nazwa: string } | null
  accountManager: { id: string; imie: string; nazwisko: string } | null
}

interface AccountManagerExpertsDialogProps {
  manager: ManagerSummary | null
  managers: ManagerSummary[]
  onOpenChange: (open: boolean) => void
  onChanged: () => void
}

async function reassignExperts(lawFirmIds: string[], accountManagerId: string | null) {
  const response = await fetch('/api/admin/account-managers/law-firms', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ lawFirmIds, accountManagerId }),
  })
  if (!response.ok) {
    const error = await response.json().catch(() => null)
    throw new Error(error?.error || 'Wystąpił błąd')
  }
  const data = await response.json()
  return data.updated as number
}

export function AccountManagerExpertsDialog({
  manager,
  managers,
  onOpenChange,
  onChanged,
}: AccountManagerExpertsDialogProps) {
  const [tab, setTab] = useState<'assigned' | 'add'>('assigned')
  const [search, setSearch] = useState('')
  const debouncedSearch = useDebounce(search, 300)
  const [addFilter, setAddFilter] = useState<'unassigned' | 'all'>('unassigned')
  const [onlyManagerVoivodeships, setOnlyManagerVoivodeships] = useState(true)
  const [experts, setExperts] = useState<ExpertRow[]>([])
  const [total, setTotal] = useState(0)
  const [loadedQuery, setLoadedQuery] = useState<string | null>(null)
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [moveTarget, setMoveTarget] = useState<string>('')
  const [saving, setSaving] = useState(false)
  const [reloadKey, setReloadKey] = useState(0)

  const managerId = manager?.id
  const managerVoivodeshipIds = manager?.voivodeships.map((v) => v.id) ?? []
  const voivodeshipFilter = onlyManagerVoivodeships ? managerVoivodeshipIds.join(',') : ''

  // Reset stanu przy otwarciu dialogu dla innego opiekuna
  const [prevManagerId, setPrevManagerId] = useState(managerId)
  if (prevManagerId !== managerId) {
    setPrevManagerId(managerId)
    setTab('assigned')
    setSearch('')
    setSelected(new Set())
    setMoveTarget('')
    setExperts([])
  }

  const params = new URLSearchParams()
  if (managerId) {
    if (debouncedSearch) params.set('search', debouncedSearch)
    if (tab === 'assigned') {
      params.set('accountManagerId', managerId)
    } else {
      params.set('excludeAccountManagerId', managerId)
      if (addFilter === 'unassigned') params.set('accountManagerId', NO_MANAGER)
      if (voivodeshipFilter) params.set('voivodeshipIds', voivodeshipFilter)
    }
  }
  const query = `${params}#${reloadKey}`
  const loading = loadedQuery !== query

  useEffect(() => {
    if (!managerId) return

    let cancelled = false
    fetch(`/api/admin/account-managers/law-firms?${query.split('#')[0]}`)
      .then((response) => (response.ok ? response.json() : Promise.reject(response)))
      .then((data) => {
        if (cancelled) return
        setExperts(data.lawFirms)
        setTotal(data.total)
        setSelected(new Set())
      })
      .catch((error) => {
        console.error('Error fetching experts:', error)
        if (!cancelled) toast.error('Błąd podczas pobierania ekspertów')
      })
      .finally(() => {
        if (!cancelled) setLoadedQuery(query)
      })

    return () => {
      cancelled = true
    }
  }, [managerId, query])

  const otherManagers = managers.filter((m) => m.id !== managerId)
  const allSelected = experts.length > 0 && experts.every((e) => selected.has(e.id))

  const toggleAll = (checked: boolean) => {
    setSelected(checked ? new Set(experts.map((e) => e.id)) : new Set())
  }

  const toggleOne = (id: string, checked: boolean) => {
    setSelected((prev) => {
      const next = new Set(prev)
      if (checked) next.add(id)
      else next.delete(id)
      return next
    })
  }

  const runChange = async (action: () => Promise<number>, successMessage: (count: number) => string) => {
    setSaving(true)
    try {
      const count = await action()
      toast.success(successMessage(count))
      setReloadKey((k) => k + 1)
      onChanged()
    } catch (error) {
      console.error('Error updating assignments:', error)
      toast.error(error instanceof Error ? error.message : 'Wystąpił błąd')
    } finally {
      setSaving(false)
    }
  }

  const handleMoveSelected = () => {
    if (!moveTarget) return
    const target = moveTarget === NO_MANAGER ? null : moveTarget
    runChange(
      () => reassignExperts([...selected], target),
      (count) => (target ? `Przeniesiono ekspertów: ${count}` : `Odpięto ekspertów: ${count}`)
    )
    setMoveTarget('')
  }

  const handleAssignSelected = () => {
    if (!managerId) return
    runChange(
      () => reassignExperts([...selected], managerId),
      (count) => `Przypisano ekspertów: ${count}`
    )
  }

  const handleMoveOne = (expertId: string, target: string) => {
    runChange(
      () => reassignExperts([expertId], target === NO_MANAGER ? null : target),
      () => (target === NO_MANAGER ? 'Ekspert został odpięty' : 'Ekspert został przeniesiony')
    )
  }

  const handleAssignByVoivodeship = (overwrite: boolean) => {
    if (!managerId) return
    if (
      overwrite &&
      !confirm('Eksperci z województw tego opiekuna zostaną odebrani innym opiekunom. Kontynuować?')
    ) {
      return
    }
    runChange(async () => {
      const response = await fetch(`/api/admin/account-managers/${managerId}/assign-by-voivodeship`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ overwrite }),
      })
      const data = await response.json().catch(() => null)
      if (!response.ok) throw new Error(data?.error || 'Wystąpił błąd')
      return data.updated as number
    }, (count) => `Przypisano ekspertów: ${count}`)
  }

  const isOutsideRegion = (expert: ExpertRow) =>
    managerVoivodeshipIds.length > 0 &&
    (!expert.voivodeship || !managerVoivodeshipIds.includes(expert.voivodeship.id))

  return (
    <Dialog open={!!manager} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Eksperci opiekuna</DialogTitle>
          <DialogDescription>
            {manager?.imie} {manager?.nazwisko} ({manager?.email})
          </DialogDescription>
          {manager && (
            <div className="flex flex-wrap items-center gap-1 pt-1">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              {manager.voivodeships.length > 0 ? (
                manager.voivodeships.map((v) => (
                  <Badge key={v.id} variant="outline">
                    {v.nazwa}
                  </Badge>
                ))
              ) : (
                <span className="text-sm text-muted-foreground">Brak przypisanych województw</span>
              )}
            </div>
          )}
        </DialogHeader>

        <Tabs
          value={tab}
          onValueChange={(value) => {
            setTab(value as 'assigned' | 'add')
            setSelected(new Set())
            setMoveTarget('')
          }}
          className="flex-1 flex flex-col min-h-0"
        >
          <div className="flex flex-wrap items-center justify-between gap-2">
            <TabsList>
              <TabsTrigger value="assigned">Przypisani</TabsTrigger>
              <TabsTrigger value="add">Dodaj ekspertów</TabsTrigger>
            </TabsList>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={saving || !manager || manager.voivodeships.length === 0}
                >
                  <MapPin className="mr-2 h-4 w-4" />
                  Przypisz wg województw
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => handleAssignByVoivodeship(false)}>
                  Tylko eksperci bez opiekuna
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleAssignByVoivodeship(true)}>
                  Wszyscy eksperci z województw (przejmij od innych)
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-3">
            <div className="relative flex-1 min-w-48">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Szukaj: nazwa, NIP, email, nazwisko, miasto..."
                className="pl-8"
              />
            </div>
            {tab === 'add' && (
              <>
                <Select value={addFilter} onValueChange={(v) => setAddFilter(v as 'unassigned' | 'all')}>
                  <SelectTrigger className="w-52">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="unassigned">Bez opiekuna</SelectItem>
                    <SelectItem value="all">Wszyscy (także u innych opiekunów)</SelectItem>
                  </SelectContent>
                </Select>
                {managerVoivodeshipIds.length > 0 && (
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="only-manager-voivodeships"
                      checked={onlyManagerVoivodeships}
                      onCheckedChange={(checked) => setOnlyManagerVoivodeships(checked === true)}
                    />
                    <Label htmlFor="only-manager-voivodeships" className="text-sm font-normal">
                      Tylko z województw opiekuna
                    </Label>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Pasek akcji zbiorczych */}
          <div className="flex flex-wrap items-center gap-2 min-h-10 pt-3">
            <span className="text-sm text-muted-foreground">
              {selected.size > 0
                ? `Zaznaczono: ${selected.size}`
                : `Wyników: ${total}${total > experts.length ? ` (pokazano ${experts.length})` : ''}`}
            </span>
            {selected.size > 0 && tab === 'assigned' && (
              <>
                <Select value={moveTarget} onValueChange={setMoveTarget}>
                  <SelectTrigger className="w-60 h-9">
                    <SelectValue placeholder="Przenieś do opiekuna..." />
                  </SelectTrigger>
                  <SelectContent>
                    {otherManagers.map((m) => (
                      <SelectItem key={m.id} value={m.id}>
                        {m.imie} {m.nazwisko}
                        {!m.aktywny && ' (nieaktywny)'}
                      </SelectItem>
                    ))}
                    <SelectItem value={NO_MANAGER}>Brak opiekuna (odepnij)</SelectItem>
                  </SelectContent>
                </Select>
                <Button size="sm" onClick={handleMoveSelected} disabled={!moveTarget || saving}>
                  Przenieś
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() =>
                    runChange(
                      () => reassignExperts([...selected], null),
                      (count) => `Odpięto ekspertów: ${count}`
                    )
                  }
                  disabled={saving}
                >
                  <UserMinus className="mr-2 h-4 w-4" />
                  Odepnij
                </Button>
              </>
            )}
            {selected.size > 0 && tab === 'add' && (
              <Button size="sm" onClick={handleAssignSelected} disabled={saving}>
                <UserPlus className="mr-2 h-4 w-4" />
                Przypisz do opiekuna ({selected.size})
              </Button>
            )}
          </div>

          <TabsContent value={tab} className="flex-1 overflow-y-auto mt-2 min-h-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-10">
                    <Checkbox
                      checked={allSelected}
                      onCheckedChange={(checked) => toggleAll(checked === true)}
                      disabled={experts.length === 0}
                    />
                  </TableHead>
                  <TableHead>Ekspert</TableHead>
                  <TableHead>Miasto</TableHead>
                  <TableHead>Województwo</TableHead>
                  <TableHead>{tab === 'assigned' ? 'Opiekun' : 'Obecny opiekun'}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading && experts.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                      Ładowanie...
                    </TableCell>
                  </TableRow>
                ) : experts.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                      {tab === 'assigned' ? 'Brak przypisanych ekspertów' : 'Brak ekspertów spełniających kryteria'}
                    </TableCell>
                  </TableRow>
                ) : (
                  experts.map((expert) => (
                    <TableRow key={expert.id} className={loading ? 'opacity-60' : undefined}>
                      <TableCell>
                        <Checkbox
                          checked={selected.has(expert.id)}
                          onCheckedChange={(checked) => toggleOne(expert.id, checked === true)}
                        />
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">
                          {expert.nazwa}
                          {!expert.aktywna && (
                            <Badge variant="secondary" className="ml-2">
                              Nieaktywny
                            </Badge>
                          )}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {expert.email}
                          {expert.numerTelefonu && ` · ${expert.numerTelefonu}`}
                        </div>
                      </TableCell>
                      <TableCell>{expert.miasto || '-'}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          {expert.voivodeship?.nazwa || '-'}
                          {tab === 'assigned' && isOutsideRegion(expert) && (
                            <span title="Ekspert spoza województw obsługiwanych przez opiekuna">
                              <AlertTriangle className="h-4 w-4 text-amber-500" />
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {tab === 'assigned' ? (
                          <Select
                            value={managerId}
                            onValueChange={(value) => handleMoveOne(expert.id, value)}
                            disabled={saving}
                          >
                            <SelectTrigger className="w-48 h-8">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {managers.map((m) => (
                                <SelectItem key={m.id} value={m.id}>
                                  {m.imie} {m.nazwisko}
                                  {!m.aktywny && ' (nieaktywny)'}
                                </SelectItem>
                              ))}
                              <SelectItem value={NO_MANAGER}>Brak opiekuna</SelectItem>
                            </SelectContent>
                          </Select>
                        ) : expert.accountManager ? (
                          `${expert.accountManager.imie} ${expert.accountManager.nazwisko}`
                        ) : (
                          <span className="text-muted-foreground">Brak</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
