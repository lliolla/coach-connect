'use client'
import * as React from "react"
import { useParams, useSearchParams } from "next/navigation"
import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"
import { CardSeance } from "@/components/seance/card_seance"
import { Button } from "@/components/ui/button"
import { IconArrowLeft } from "@tabler/icons-react"
import Link from "next/link"

export default function EditSessionPage() {
  const { id } = useParams()
  const searchParams = useSearchParams()
  const mode = searchParams.get('mode') || 'edit' // Par défaut 'edit' pour rétrocompatibilité

  const title = mode === 'view' ? "Voir la séance" : "Modifier la séance"

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
          <div className="flex items-center gap-4">
            <Button variant="outline" size="icon" asChild>
              <Link href="/sessions">
                <IconArrowLeft size={18} />
              </Link>
            </Button>
            <h1 className="text-2xl font-bold">{title}</h1>
          </div>

          <div className="max-w-4xl mx-auto w-full py-8">
            <CardSeance mode={mode} seanceId={id} />
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
