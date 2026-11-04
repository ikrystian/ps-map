import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { Archive, ArchiveRestore, MessageSquare } from "lucide-react"
import { useDeferredValue, useMemo } from "react"
import { Link } from "react-router-dom"
import { Screen } from "@/components/Screen"
import { useToast } from "@/components/toast"
import {
  Avatar,
  Card,
  EmptyState,
  ErrorState,
  PageHeader,
  RowsSkeleton,
  SearchInput,
  Segmented,
  SwipeAction,
  SwipeRow,
  cn,
} from "@/components/ui"
import { api } from "@/lib/api"
import { formatListTime, matchesPhrase } from "@/lib/format"
import { useStickyState } from "@/lib/sticky"
import type { Conversation } from "@/lib/types"

type Filter = "active" | "archived"

const LIST_REFRESH_INTERVAL = 15 * 1000

export function ConversationsPage() {
  const toast = useToast()
  const queryClient = useQueryClient()
  const [filter, setFilter] = useStickyState<Filter>("conversations.filter", "active")
  const [query, setQuery] = useStickyState("conversations.query", "")
  const phrase = useDeferredValue(query)
  const { data, isPending, error, refetch } = useQuery({
    queryKey: ["conversations", filter],
    queryFn: () => api<Conversation[]>(`/api/conversations?filter=${filter}`),
    refetchInterval: LIST_REFRESH_INTERVAL,
  })

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["conversations"] })

  const toggleArchive = useMutation({
    mutationFn: ({ conversationId, archive }: { conversationId: string; archive: boolean }) =>
      archive
        ? api("/api/conversations/archive", { method: "POST", body: { conversationId } })
        : api(`/api/conversations/archive?conversationId=${conversationId}`, { method: "DELETE" }),
    onSuccess: (_data, { conversationId, archive }) => {
      toast.success(archive ? "Rozmowa zarchiwizowana" : "Rozmowa przywrócona", {
        label: "Cofnij",
        onClick: () => toggleArchive.mutate({ conversationId, archive: !archive }),
      })
      void invalidate()
    },
    onError: toast.error,
  })

  const filtered = useMemo(
    () =>
      (data ?? []).filter((conversation) =>
        matchesPhrase(`${conversation.otherUser.name} ${conversation.lastMessage?.content ?? ""}`, phrase)
      ),
    [data, phrase]
  )

  return (
    <Screen
      tabRoot
      header={
        <PageHeader title="Wiadomości">
          <Segmented
            label="Rozmowy"
            value={filter}
            onChange={setFilter}
            options={[
              { value: "active", label: "Aktywne" },
              { value: "archived", label: "Archiwum" },
            ]}
          />
        </PageHeader>
      }
    >
      {!!data?.length && <SearchInput label="Szukaj rozmów" placeholder="Szukaj rozmów…" value={query} onChange={setQuery} />}

      {isPending ? (
        <RowsSkeleton label="Wczytywanie rozmów…" />
      ) : !data ? (
        <ErrorState error={error} onRetry={() => void refetch()} />
      ) : filtered.length === 0 ? (
        <EmptyState icon={MessageSquare} title={query ? "Nic nie znaleziono" : "Brak rozmów"}>
          {query
            ? "Żadna rozmowa nie pasuje do wyszukiwania."
            : filter === "active"
              ? "Rozmowy z klientami pojawią się tutaj."
              : "Archiwum jest puste."}
        </EmptyState>
      ) : (
        <ul className="space-y-2">
          {filtered.map((conversation) => {
            const hasUnread = conversation.unreadCount > 0 && !conversation.lastMessage?.isFromMe
            const archive = filter === "active"
            return (
              <li key={conversation.id}>
                <SwipeRow
                  action={
                    <SwipeAction
                      icon={archive ? Archive : ArchiveRestore}
                      label={archive ? "Archiwizuj" : "Przywróć"}
                      disabled={toggleArchive.isPending}
                      onClick={() => toggleArchive.mutate({ conversationId: conversation.id, archive })}
                      className="bg-primary-fill text-primary-foreground"
                    />
                  }
                >
                  <Card flush>
                    <Link
                      to={`/wiadomosci/${conversation.id}`}
                      className="flex min-w-0 items-center gap-3 rounded-2xl p-3 transition-colors active:bg-muted/50"
                    >
                      <Avatar name={conversation.otherUser.name} src={conversation.otherUser.image} online={conversation.otherUser.isOnline} />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-baseline justify-between gap-2">
                          <p className={cn("truncate text-[15px]", hasUnread ? "font-semibold" : "font-medium")}>
                            {conversation.otherUser.name}
                          </p>
                          {conversation.lastMessage && (
                            <span className={cn("shrink-0 text-xs", hasUnread ? "font-medium text-primary" : "text-muted-foreground")}>
                              {formatListTime(conversation.lastMessage.createdAt)}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <p className={cn("min-w-0 flex-1 truncate text-[13px]", hasUnread ? "font-medium text-foreground" : "text-muted-foreground")}>
                            {conversation.lastMessage
                              ? `${conversation.lastMessage.isFromMe ? "Ty: " : ""}${conversation.lastMessage.content}`
                              : "Brak wiadomości"}
                          </p>
                          {hasUnread && (
                            <span className="flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full bg-primary-fill px-1.5 text-[11px] font-semibold text-primary-foreground">
                              {conversation.unreadCount > 9 ? "9+" : conversation.unreadCount}
                            </span>
                          )}
                        </div>
                      </div>
                    </Link>
                  </Card>
                </SwipeRow>
              </li>
            )
          })}
        </ul>
      )}
      {!!filtered.length && (
        <p className="text-center text-xs text-muted-foreground">Przesuń rozmowę w lewo, aby {filter === "active" ? "ją zarchiwizować" : "ją przywrócić"}</p>
      )}
    </Screen>
  )
}
