'use client'

import * as React from "react"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import Link from "next/link"

const routeLabels = {
  "athletes": "Athlètes",
  "new": "Nouvel Athlète",
  "suivis": "Suivis",
  "parametrage": "Paramétrage",
  "dashboard": "Tableau de bord"
};

export function SiteHeader() {
  const pathname = usePathname()
  
  // Split path and filter out empty strings
  const segments = pathname.split('/').filter(segment => segment !== "")
  
  const generateBreadcrumbs = () => {
    const breadcrumbs = []
    
    // Always add home/dashboard if not at root
    breadcrumbs.push({
      label: "Tableau de bord",
      href: "/dashboard",
      isPage: pathname === "/dashboard" || pathname === "/"
    })

    let currentHref = ""
    segments.forEach((segment, index) => {
      // Skip dashboard as we already added it
      if (segment === "dashboard") return

      currentHref += `/${segment}`
      const isLast = index === segments.length - 1
      
      // Try to get label from mapping, or use capitalized segment
      let label = routeLabels[segment]
      
      // If it looks like a UUID or ID (not in mapping and not first level)
      if (!label && index > 0) {
        label = "Détails"
      } else if (!label) {
        label = segment.charAt(0).toUpperCase() + segment.slice(1)
      }

      breadcrumbs.push({
        label,
        href: currentHref,
        isPage: isLast
      })
    })

    return breadcrumbs
  }

  const breadcrumbs = generateBreadcrumbs()

  return (
    <header className="flex h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mx-2 data-[orientation=vertical]:h-4" />
        
        <Breadcrumb>
          <BreadcrumbList>
            {breadcrumbs.map((crumb, index) => (
              <React.Fragment key={crumb.href}>
                <BreadcrumbItem>
                  {crumb.isPage ? (
                    <BreadcrumbPage>{crumb.label}</BreadcrumbPage>
                  ) : (
                    <BreadcrumbLink asChild>
                      <Link href={crumb.href}>{crumb.label}</Link>
                    </BreadcrumbLink>
                  )}
                </BreadcrumbItem>
                {index < breadcrumbs.length - 1 && <BreadcrumbSeparator />}
              </React.Fragment>
            ))}
          </BreadcrumbList>
        </Breadcrumb>

        <div className="ml-auto flex items-center gap-2">
          <Button variant="ghost" asChild size="sm" className="hidden sm:flex">
            <a
              href="https://github.com/shadcn-ui/ui/tree/main/apps/v4/app/(examples)/dashboard"
              rel="noopener noreferrer"
              target="_blank"
              className="dark:text-foreground">
              GitHub
            </a>
          </Button>
        </div>
      </div>
    </header>
  )
}
