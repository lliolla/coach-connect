'use client'
import * as React from "react"
import { useParams } from "next/navigation"
import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"
import { CardExercice } from "@/components/exercice/card_exercice"
import { Button } from "@/components/ui/button"
import { IconArrowLeft } from "@tabler/icons-react"
import Link from "next/link"

export default function EditExercicePage() {
  const { id } = useParams()

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
              <Link href="/exercices">
                <IconArrowLeft size={18} />
              </Link>
            </Button>
            <h1 className="text-2xl font-bold">Modifier l'exercice</h1>
          </div>

          <div className="max-w-3xl mx-auto w-full py-8">
            <CardExercice mode="edit" exerciceId={id} />
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
