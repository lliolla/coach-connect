'use client'
import * as React from "react"
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  MoreHorizontal,
  Eye,
  Edit2,
  Copy,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Mail,
  Send,
  Target,
  Calendar
} from 'lucide-react'
import { toast } from "sonner"
import { cn, getSessionNumber } from "@/lib/utils"
import { transmitSession } from "@/app/actions/sessions"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

const ITEMS_PER_PAGE = 10



export default function GenericTable({
  data,
  columns,
  onDelete,
  onEdit,
  onView,
  onDuplicate,
  onTransmit,
  onRealisationChange,
  context = "sessions",
  searchTerm = "",
  showRealisation = false,
  emptyStateText = "Aucun élément trouvé"
}) {
  const router = useRouter()
  const [currentPage, setCurrentPage] = React.useState(1)

  const isTracking = context === "seances" || context === "athlete-seances"
  const showAthlete = context === "seances"
  const isObjectifs = context === "objectifs"

  // Filtrage par Search Term
  const filteredData = React.useMemo(() => {
    if (!searchTerm) return data

    const lowerTerm = searchTerm.toLowerCase()
    return data.filter(item => {
      return columns.some(column => {
        const value = column.cell
          ? String(column.cell(item) || '')
          : String(item[column.accessorKey] || '')

        return value.toLowerCase().includes(lowerTerm)
      })
    })
  }, [data, searchTerm, columns])

  // Pagination logic
  const totalItems = filteredData?.length || 0
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE)
  const paginatedData = React.useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
    return filteredData.slice(startIndex, startIndex + ITEMS_PER_PAGE)
  }, [filteredData, currentPage])

  // Reset page when search term changes
  React.useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm])

  const handleDuplicate = (itemId) => {
    if (isObjectifs) return
    if (onDuplicate) {
      onDuplicate(itemId)
    }
  }

  const handleDelete = (item) => {
    if (onDelete) {
      onDelete(item)
    }
  }

  const handleTransmit = async (item) => {
    if (!onTransmit) return

    const toastId = toast.loading("Transmission en cours...")
    try {
      const result = await onTransmit(item)
      if (result.success) {
        toast.success("Transmis avec succès", { id: toastId })
        router.refresh()
      } else {
        toast.error("Erreur lors de la transmission : " + result.error, { id: toastId })
      }
    } catch (err) {
      toast.error("Une erreur inattendue est survenue", { id: toastId })
    }
  }

  const getBasePath = (id) => {
    const isAthlete = context === "athlete-seances"
    if (isAthlete) return `/admin/seances/${id}`
    if (isObjectifs) return `/admin/objectifs/${id}`
    return `/admin/seances/${id}`
  }

  const handlePrevPage = () => {
    setCurrentPage(prev => Math.max(prev - 1, 1))
  }

  const handleNextPage = () => {
    setCurrentPage(prev => Math.min(prev + 1, totalPages))
  }

  if (!filteredData || filteredData.length === 0) {
    return (
      <div className="text-center py-12 border-2 border-dashed rounded-xl bg-muted/5 text-muted-foreground">
        <p className="text-sm font-medium">{emptyStateText}</p>
      </div>
    )
  }

  return (
    <div className="rounded-xl border shadow-sm bg-card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-border">
          <thead className="bg-muted/30">
            <tr>
              {isTracking && !isObjectifs && (
                <th scope="col" className="px-6 py-4 text-center text-xs font-bold text-black uppercase tracking-wider">
                  <Mail size={16} />
                </th>
              )}
              {showAthlete && !isObjectifs && (
                <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-black uppercase tracking-wider">
                  Athlète
                </th>
              )}
              {columns.map((column) => (
                <th
                  key={column.accessorKey}
                  scope="col"
                  className={`px-6 py-4 text-left text-xs font-bold text-black uppercase tracking-wider ${column.headerClassName || ''}`}
                >
                  {column.header}
                </th>
              ))}
              {showRealisation && !isObjectifs && (
                <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-black uppercase tracking-wider">
                  Réalisation
                </th>
              )}
              {!isObjectifs && (
                <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-black uppercase tracking-wider">
                  Progression
                </th>
              )}
              <th scope="col" className="px-6 py-4 text-right text-xs font-bold text-black uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-transparent divide-y divide-border">
            {paginatedData.map((item) => {
              const progression = isObjectifs ? null : getSessionNumber(item.id, item.rawObjectif)
              return (
                <tr key={item.id} className="hover:bg-muted/5 transition-colors group">
                  {isTracking && !isObjectifs && (
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                      <Mail
                        size={16}
                        className={cn(
                          "mx-auto transition-colors duration-300",
                          item.status === 'transmis' ? "text-green-500" : "text-amber-500"
                        )}
                        onClick={() => console.log("Statut:", item.status, item)}
                      />
                    </td>
                  )}
                  {showAthlete && !isObjectifs && (
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-600 italic">
                      {item.personName || '-'}
                    </td>
                  )}
                  {columns.map((column) => (
                    <td
                      key={column.accessorKey}
                      className={`px-6 py-4 text-sm ${column.cellClassName || ''} ${column.textColor || 'text-gray-600'}`}
                    >
                      {column.cell ? column.cell(item) : item[column.accessorKey]}
                    </td>
                  ))}
                  {showRealisation && !isObjectifs && (
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <Select
                        value={item.realisation || ""}
                        onValueChange={(value) => onRealisationChange?.(item.id, value)}
                        className="h-8 w-32"
                      >
                        <SelectTrigger className="h-8 text-xs">
                          <SelectValue placeholder="Sélectionner" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Complet">Complet</SelectItem>
                          <SelectItem value="Partiel">Partiel</SelectItem>
                        </SelectContent>
                      </Select>
                    </td>
                  )}
                  {!isObjectifs && (
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      {progression ? (
                        <div className="inline-flex items-center gap-1.5 text-[10px] text-primary font-black uppercase tracking-widest bg-primary/5 px-2 py-1 rounded-full border border-primary/10">
                          <Target size={10} />
                          {progression}
                        </div>
                      ) : (
                        <span className="text-gray-400 italic text-xs">Hors objectif</span>
                      )}
                    </td>
                  )}
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                    <div className="hidden md:flex justify-end gap-1">
                      {isTracking && !isObjectifs && context !== "athlete-seances" && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-primary hover:bg-primary/5"
                          onClick={() => handleTransmit(item)}
                          title="Transmettre"
                        >
                          <Send size={14}/>
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-primary hover:bg-primary/5"
                        asChild
                        title="Voir"
                      >
                        <Link href={`${getBasePath(item.id)}?mode=view&context=${context}`}>
                          <Eye size={14}/>
                        </Link>
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-primary hover:bg-primary/5"
                        asChild
                        title="Modifier"
                      >
                        <Link href={`${getBasePath(item.id)}?mode=edit&context=${context}`}>
                          <Edit2 size={14}/>
                        </Link>
                      </Button>
                      {!isObjectifs && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-primary hover:bg-primary/5"
                          onClick={() => handleDuplicate(item.id)}
                          title="Dupliquer"
                        >
                          <Copy size={14}/>
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/5"
                        onClick={() => handleDelete(item)}
                        title="Supprimer"
                      >
                        <Trash2 size={14}/>
                      </Button>
                    </div>
                    <div className="md:hidden">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {isTracking && !isObjectifs && context !== "athlete-seances" && (
                            <DropdownMenuItem onSelect={() => handleTransmit(item)}>
                              <Send size={14} className="mr-2"/> Transmettre
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem asChild>
                            <Link href={`${getBasePath(item.id)}?mode=view&context=${context}`}>
                              <Eye size={14} className="mr-2"/> Voir
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link href={`${getBasePath(item.id)}?mode=edit&context=${context}`}>
                              <Edit2 size={14} className="mr-2"/> Modifier
                            </Link>
                          </DropdownMenuItem>
                          {!isObjectifs && (
                            <DropdownMenuItem onSelect={() => handleDuplicate(item.id)}>
                              <Copy size={14} className="mr-2"/> Dupliquer
                            </DropdownMenuItem>
                          )}
                          {!isObjectifs && <DropdownMenuSeparator />}
                          <DropdownMenuItem
                            onSelect={() => handleDelete(item)}
                            className="text-red-600 focus:text-red-700 font-medium"
                          >
                            <Trash2 size={14} className="mr-2"/> Supprimer
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
      <div className="px-6 py-4 bg-muted/20 border-t border-border flex items-center justify-between">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          Page <span className="text-foreground">{currentPage}</span> sur <span className="text-foreground">{totalPages || 1}</span>
        </p>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="h-7 text-[9px] px-2 font-bold uppercase tracking-widest bg-background hover:bg-muted transition-colors disabled:opacity-40"
            onClick={handlePrevPage}
            disabled={currentPage === 1}
          >
            <ChevronLeft size={12} className="mr-1" /> Précédent
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="h-7 text-[9px] px-2 font-bold uppercase tracking-widest bg-background hover:bg-muted transition-colors disabled:opacity-40"
            onClick={handleNextPage}
            disabled={currentPage === totalPages || totalPages === 0}
          >
            Suivant <ChevronRight size={12} className="ml-1" />
          </Button>
        </div>
      </div>
    </div>
  )
}
