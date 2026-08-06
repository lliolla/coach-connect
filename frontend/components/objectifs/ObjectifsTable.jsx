// frontend/components/objectifs/ObjectifsTable.jsx
'use client'
import * as React from "react"
import GenericTable from "@/components/common/GenericTable"
import {
  IconTarget,
  IconUser,
  IconCalendar,
  IconDumbbell
} from "@tabler/icons-react"

export default function ObjectifsTable({ objectifs, onDelete, searchTerm }) {
  const columns = React.useMemo(() => [
    {
      accessorKey: "label",
      header: "Nom",
      cell: (item) => (
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
            <IconTarget className="h-4 w-4 text-primary" />
          </div>
          <span className="font-medium">{item.label}</span>
        </div>
      ),
      headerClassName: "w-1/4",
      cellClassName: "font-medium"
    },
    {
      accessorKey: "athleteName",
      header: "Athlète",
      cell: (item) => (
        <div className="flex items-center gap-2">
          <IconUser className="h-4 w-4 text-muted-foreground" />
          <span>{item.athletes_objectifs?.[0]?.athlete?.first_name} {item.athletes_objectifs?.[0]?.athlete?.last_name}</span>
        </div>
      ),
      headerClassName: "w-1/3",
      cellClassName: "text-muted-foreground"
    },
    {
      accessorKey: "sessionsCount",
      header: "Séances",
      cell: (item) => (
        <div className="flex items-center gap-2">
          <IconCalendar className="h-4 w-4 text-muted-foreground" />
          <span>{item.sessions?.length || 0}</span>
        </div>
      ),
      headerClassName: "w-1/6",
      cellClassName: "text-muted-foreground"
    },
    {
      accessorKey: "totalSessions",
      header: "Total",
      cell: (item) => (
        <div className="flex items-center gap-2">
          <IconDumbbell className="h-4 w-4 text-muted-foreground" />
          <span>{item.total_sessions || 0}</span>
        </div>
      ),
      headerClassName: "w-1/6",
      cellClassName: "text-muted-foreground"
    }
  ], [])

  const objectifsForTable = React.useMemo(() => {
    return objectifs.map(obj => ({
      ...obj,
      athleteName: obj.athletes_objectifs?.[0]?.athlete?.first_name + ' ' + obj.athletes_objectifs?.[0]?.athlete?.last_name,
      sessionsCount: obj.sessions?.length || 0
    }))
  }, [objectifs])

  return (
    <GenericTable
      data={objectifsForTable}
      columns={columns}
      onDelete={onDelete}
      searchTerm={searchTerm}
      emptyStateText="Aucun objectif trouvé"
      context="objectifs"
    />
  )
}