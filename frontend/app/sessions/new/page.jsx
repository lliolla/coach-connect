'use client'
import * as React from "react"
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

export default function NewSessionPage() {
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
              <Link href="/suivis">
                <IconArrowLeft size={18} />
              </Link>
            </Button>
            <h1 className="text-2xl font-bold">Créer un programme</h1>
          </div>

          <div className="max-w-4xl mx-auto w-full py-8">
            <CardSeance mode="create" />
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
