

'use client'
import * as React from "react"
import { useParams, useSearchParams } from "next/navigation"
import { AppSidebar } from "@/components/nav/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"
import { CardSeance } from "@/components/seance/card_seance"
import { Button } from "@/components/ui/button"
import { IconArrowLeft } from "@tabler/icons-react"
import Link from "next/link"

function SeanceDetailsContent() {
  const { id } = useParams()
  const searchParams = useSearchParams()
  const mode = searchParams.get('mode') || 'view'
  
  const title = mode === 'edit' ? "Modifier la séance" : "Détails de la séance"

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 md:p-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild>
          <Link href="/seances">
            <IconArrowLeft size={18} />
          </Link>
        </Button>
        <h1 className="text-2xl font-bold">{title}</h1>
      </div>

      <div className="max-w-4xl mx-auto w-full py-8">
        <CardSeance mode={mode} seanceId={id} isTracking={true} />
      </div>
    </div>
  )
}

export default function SeanceDetailsPage() {
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
          <SeanceDetailsContent />
        </React.Suspense>
      </SidebarInset>
    </SidebarProvider>
  )
}
