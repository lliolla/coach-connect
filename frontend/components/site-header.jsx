'use client'

import { SidebarIcon } from "lucide-react"
import { SearchForm } from "@/components/ui/sidebar"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import {
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { usePathname } from "next/navigation"
import * as React from "react"

const routeLabels = {
  "dashboard": "Tableau de bord",
  "athletes": "Athlètes",
  "sessions": "Bibliothèque de séances",
  "seances": "Séances",
  "exercices": "Exercices",
  "parametrage": "Paramétrage",
  "new": "Nouveau",
}

export function SiteHeader() {
  const pathname = usePathname()
  
  const breadcrumbs = React.useMemo(() => {
    const paths = pathname.split('/').filter(p => p)
    return paths.map((path, index) => {
      const url = `/${paths.slice(0, index + 1).join('/')}`
      const label = routeLabels[path] || path
      return { label, url, isLast: index === paths.length - 1 }
    })
  }, [pathname])

  return (
    <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4 sticky top-0 z-50 bg-background/80 backdrop-blur-md">
      <SidebarTrigger className="-ml-1" />
      <Separator orientation="vertical" className="mr-2 h-4" />
      <Breadcrumb>
        <BreadcrumbList>
          {breadcrumbs.map((crumb, index) => (
            <React.Fragment key={crumb.url}>
              <BreadcrumbItem className={crumb.isLast ? "" : "hidden md:block"}>
                {crumb.isLast ? (
                  <BreadcrumbPage className="font-bold text-foreground">{crumb.label}</BreadcrumbPage>
                ) : (
                  <BreadcrumbLink href={crumb.url}>{crumb.label}</BreadcrumbLink>
                )}
              </BreadcrumbItem>
              {!crumb.isLast && <BreadcrumbSeparator className="hidden md:block" />}
            </React.Fragment>
          ))}
        </BreadcrumbList>
      </Breadcrumb>
      <div className="ml-auto flex items-center gap-4">
        {/* <SearchForm className="hidden md:flex" /> */}
      </div>
    </header>
  )
}
