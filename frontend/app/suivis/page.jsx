'use client'

import * as React from "react"
import Link from "next/link"
import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { CalendarView } from "@/components/seance/calendar-view"
import { 
  IconPlus, 
  IconSearch,
  IconCalendarEvent
} from "@tabler/icons-react"

export default function PlanPage() {
  const [searchTerm, setSearchTerm] = React.useState("")

  return (
    <SidebarProvider
      style={{
        "--sidebar-width": "calc(var(--spacing) * 72)",
        "--header-height": "calc(var(--spacing) * 12)"
      }}>
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col gap-4 p-4 md:p-6">
          {/* Header Section like Athletes Page */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Plan d'Entraînement</h1>
              <p className="text-muted-foreground text-sm">Gérez les séances et suivez votre planning.</p>
            </div>
            <Button className="gap-2" asChild>
              <Link href="/sessions/new">
                <IconPlus size={18} />
                Nouvelle Séance
              </Link>
            </Button>
          </div>

          <div className="relative">
            <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
            <Input 
              placeholder="Rechercher une séance ou un athlète..." 
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Calendar and Sessions Section */}
          <div className="mt-4">
            <div className="flex items-center gap-2 mb-4">
              <IconCalendarEvent size={20} className="text-primary" />
              <h2 className="text-lg font-semibold">Calendrier des séances</h2>
            </div>
            <CalendarView searchTerm={searchTerm} />
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
