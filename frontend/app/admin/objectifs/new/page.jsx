'use client'
import * as React from "react"
import { useSearchParams } from "next/navigation"
import { AppSidebar } from "@/components/nav/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { IconArrowLeft } from "@tabler/icons-react"
import Link from "next/link"
import { CardObjectif } from "@/components/objectif/card_objectif"

function NewObjectifContent() {
  const searchParams = useSearchParams()
  const athleteId = searchParams.get('athlete_id')

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 md:p-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild>
          <Link href="/admin/objectifs">
            <IconArrowLeft size={18} />
          </Link>
        </Button>
        <h1 className="text-2xl font-bold">Nouvel objectif</h1>
      </div>

      <div className="max-w-4xl mx-auto w-full py-8">
        <CardObjectif mode="create" presetAthleteId={athleteId} />
      </div>
    </div>
  )
}

export default function NewObjectifPage() {
  return (
    <SidebarProvider
      style={{
        "--sidebar-width": "calc(var(--spacing) * 72)",
        "--header-height": "calc(var(--spacing) * 12)"
      }}>
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <React.Suspense fallback={<div className="flex justify-center p-8">Chargement...</div>}>
          <NewObjectifContent />
        </React.Suspense>
      </SidebarInset>
    </SidebarProvider>
  )
}
