'use client'

import * as React from "react"
import { IconUsers, IconCalendarEvent, IconChartBar, IconTrendingUp, IconActivity } from "@tabler/icons-react"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export function SectionCards() {
  const [stats, setStats] = React.useState({
    totalAthletes: 0,
    activeSessions: 0,
    newThisMonth: 0,
    avgPerformance: "85%"
  })

  React.useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const response = await fetch('http://127.0.0.1:3001/api/athletes')
      if (response.ok) {
        const athletes = await response.json()
        setStats(prev => ({
          ...prev,
          totalAthletes: athletes.length,
          newThisMonth: Math.floor(athletes.length * 0.2), // Mock logic for demo
          activeSessions: Math.floor(athletes.length * 1.5)
        }))
      }
    } catch (error) {
      console.error(error)
    }
  }

  return (
    (<div
      className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
      
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Total Athlètes</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {stats.totalAthletes}
          </CardTitle>
          <CardAction>
            <IconUsers className="text-primary opacity-20" size={40} />
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            <IconTrendingUp className="size-4 text-green-500" /> +{stats.newThisMonth} ce mois-ci
          </div>
          <div className="text-muted-foreground">
            Croissance de la base athlète
          </div>
        </CardFooter>
      </Card>

      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Séances Actives</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {stats.activeSessions}
          </CardTitle>
          <CardAction>
            <IconActivity className="text-primary opacity-20" size={40} />
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Planifiées pour cette semaine
          </div>
          <div className="text-muted-foreground">
            Volume d'entraînement global
          </div>
        </CardFooter>
      </Card>

      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Assiduité Moyenne</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {stats.avgPerformance}
          </CardTitle>
          <CardAction>
            <IconChartBar className="text-primary opacity-20" size={40} />
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Score de complétion
          </div>
          <div className="text-muted-foreground">Stable sur les 30 derniers jours</div>
        </CardFooter>
      </Card>

      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Objectifs Atteints</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            12
          </CardTitle>
          <CardAction>
            <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-500/20">
              Succès
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Félicitations aux athlètes !
          </div>
          <div className="text-muted-foreground">Objectifs validés cette semaine</div>
        </CardFooter>
      </Card>
    </div>)
  );
}
