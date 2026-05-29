"use client"

import {
  Breadcrumb,
  BreadcrumbEllipsis,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import Link from "next/link"
import React from "react"

export interface BreadcrumbItemData {
  label: string
  href?: string
}

interface ResponsiveBreadcrumbsProps {
  items: BreadcrumbItemData[]
}

export function ResponsiveBreadcrumbs({ items }: ResponsiveBreadcrumbsProps) {
  if (!items || items.length === 0) return null

  // If there are 3 or fewer items, show all on all screens
  if (items.length <= 3) {
    return (
      <Breadcrumb>
        <BreadcrumbList className="text-neutral-400">
          {items.map((item, index) => {
            const isLast = index === items.length - 1
            return (
              <React.Fragment key={index}>
                <BreadcrumbItem>
                  {isLast || !item.href ? (
                    <BreadcrumbPage className="text-white font-medium">
                      {item.label}
                    </BreadcrumbPage>
                  ) : (
                    <BreadcrumbLink asChild className="hover:text-white transition-colors">
                      <Link href={item.href}>{item.label}</Link>
                    </BreadcrumbLink>
                  )}
                </BreadcrumbItem>
                {!isLast && <BreadcrumbSeparator className="text-neutral-600 font-bold" />}
              </React.Fragment>
            )
          })}
        </BreadcrumbList>
      </Breadcrumb>
    )
  }

  // If 4 or more items, implement responsive collapsing for mobile
  const firstItem = items[0]
  const lastItem = items[items.length - 1]
  const middleItems = items.slice(1, items.length - 1)

  return (
    <Breadcrumb>
      {/* Desktop View: Show all items */}
      <BreadcrumbList className="hidden md:flex text-neutral-400">
        {items.map((item, index) => {
          const isLast = index === items.length - 1
          return (
            <React.Fragment key={index}>
              <BreadcrumbItem>
                {isLast || !item.href ? (
                  <BreadcrumbPage className="text-white font-medium">
                    {item.label}
                  </BreadcrumbPage>
                ) : (
                  <BreadcrumbLink asChild className="hover:text-white transition-colors">
                    <Link href={item.href}>{item.label}</Link>
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
              {!isLast && <BreadcrumbSeparator className="text-neutral-600 font-bold" />}
            </React.Fragment>
          )
        })}
      </BreadcrumbList>

      {/* Mobile View: Collapsed middle items */}
      <BreadcrumbList className="flex md:hidden text-neutral-400">
        {/* First Item */}
        <BreadcrumbItem>
          {firstItem.href ? (
            <BreadcrumbLink asChild className="hover:text-white transition-colors">
              <Link href={firstItem.href}>{firstItem.label}</Link>
            </BreadcrumbLink>
          ) : (
            <BreadcrumbPage className="text-white font-medium">{firstItem.label}</BreadcrumbPage>
          )}
        </BreadcrumbItem>

        <BreadcrumbSeparator className="text-neutral-600 font-bold" />

        {/* Collapsed Dropdown for Middle Items */}
        <BreadcrumbItem>
          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center gap-1 hover:text-white transition-colors focus:outline-none">
              <BreadcrumbEllipsis className="h-4 w-4" />
              <span className="sr-only">Rozwiń menu</span>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="bg-[#121211] border border-neutral-800 text-neutral-400">
              {middleItems.map((item, index) => (
                <DropdownMenuItem key={index} className="focus:bg-neutral-800 focus:text-white">
                  {item.href ? (
                    <Link href={item.href} className="w-full">
                      {item.label}
                    </Link>
                  ) : (
                    <span>{item.label}</span>
                  )}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </BreadcrumbItem>

        <BreadcrumbSeparator className="text-neutral-600 font-bold" />

        {/* Last Item (Active Page) */}
        <BreadcrumbItem>
          <BreadcrumbPage className="text-white font-medium max-w-[150px] truncate">
            {lastItem.label}
          </BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  )
}
