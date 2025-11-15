'use client'

import { useEffect, useState } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Mail, Phone, X } from 'lucide-react'
import { motion, AnimatePresence } from 'motion/react'

interface AccountManager {
  id: string
  imie: string
  nazwisko: string
  email: string
  telefon: string | null
  avatar: string | null
}

export function AccountManagerWidget() {
  const [accountManager, setAccountManager] = useState<AccountManager | null>(null)
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    console.log('[AccountManagerWidget] Component mounted! Starting fetch...')
    fetchAccountManager()
  }, [])

  const fetchAccountManager = async () => {
    try {
      console.log('[AccountManagerWidget] Fetching account manager...')
      const response = await fetch('/api/law-firms/me/account-manager')
      console.log('[AccountManagerWidget] Response status:', response.status)

      if (response.ok) {
        const data = await response.json()
        console.log('[AccountManagerWidget] Data received:', data)
        setAccountManager(data.accountManager)
      } else {
        const errorText = await response.text()
        console.log('[AccountManagerWidget] Response not OK:', errorText)
      }
    } catch (error) {
      console.error('[AccountManagerWidget] Error fetching account manager:', error)
    } finally {
      setIsLoading(false)
      console.log('[AccountManagerWidget] Fetch complete, isLoading set to false')
    }
  }

  console.log('[AccountManagerWidget] Render - isLoading:', isLoading, 'accountManager:', accountManager)

  if (isLoading) {
    console.log('[AccountManagerWidget] Still loading, returning null')
    return null
  }

  if (!accountManager) {
    console.log('[AccountManagerWidget] No account manager, returning null')
    return null
  }

  const initials = `${accountManager.imie[0]}${accountManager.nazwisko[0]}`
  console.log('[AccountManagerWidget] Rendering widget with initials:', initials)

  return (
    <>
      {/* Avatar Button - Fixed Position */}
      <motion.div
        initial={{ x: 100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="fixed right-6 bottom-6 z-50"
      >
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="group relative"
          aria-label="Kontakt z opiekunem"
        >
          <div className="relative">
            <Avatar className="h-14 w-14 ring-2 ring-white shadow-lg transition-transform group-hover:scale-110">
              <AvatarImage src={accountManager.avatar || undefined} alt={`${accountManager.imie} ${accountManager.nazwisko}`} />
              <AvatarFallback className="bg-primary text-white font-semibold">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="absolute -top-1 -right-1 h-4 w-4 bg-green-500 rounded-full border-2 border-white" />
          </div>

          {/* Tooltip */}
          <div className="absolute bottom-full right-0 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
            <div className="bg-gray-900 text-white text-xs rounded py-1 px-2 whitespace-nowrap">
              Twój opiekun
            </div>
          </div>
        </button>
      </motion.div>

      {/* Contact Card - Expanded View */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/20 z-40"
            />

            {/* Contact Card */}
            <motion.div
              initial={{ x: 400, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 400, opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed right-6 bottom-24 z-50 w-80"
            >
              <Card className="shadow-2xl">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={accountManager.avatar || undefined} alt={`${accountManager.imie} ${accountManager.nazwisko}`} />
                        <AvatarFallback className="bg-primary text-white">
                          {initials}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <CardTitle className="text-lg">
                          {accountManager.imie} {accountManager.nazwisko}
                        </CardTitle>
                        <p className="text-sm text-gray-500">Twój opiekun</p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsOpen(false)}
                      className="h-8 w-8 p-0"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="space-y-2">
                    <a
                      href={`mailto:${accountManager.email}`}
                      className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-center justify-center h-10 w-10 bg-blue-100 text-blue-600 rounded-lg">
                        <Mail className="h-5 w-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900">Email</p>
                        <p className="text-sm text-gray-500 truncate">{accountManager.email}</p>
                      </div>
                    </a>

                    {accountManager.telefon && (
                      <a
                        href={`tel:${accountManager.telefon}`}
                        className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-100 transition-colors"
                      >
                        <div className="flex items-center justify-center h-10 w-10 bg-green-100 text-green-600 rounded-lg">
                          <Phone className="h-5 w-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900">Telefon</p>
                          <p className="text-sm text-gray-500">{accountManager.telefon}</p>
                        </div>
                      </a>
                    )}
                  </div>

                  <div className="pt-3 border-t">
                    <p className="text-xs text-gray-500 text-center">
                      Jesteśmy tutaj, aby Ci pomóc! Skontaktuj się z nami w razie pytań.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
