// frontend/components/seance/programTable.jsx
import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { MoreVertical, Eye, Edit2, Copy, Trash2, ChevronLeft, ChevronRight, Mail, Send, Target, Calendar, ChevronDown } from 'lucide-react';
import { toast } from "sonner";
import { cn, getSessionProgression } from "@/lib/utils";
import { transmitSession } from "@/app/actions/sessions";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const ITEMS_PER_PAGE = 10;

const ProgramTable = ({ programs, onDelete, context = "sessions", searchTerm = "", onRealisationChange, showRealisation = false }) => {
  const router = useRouter();
  const [currentPage, setCurrentPage] = useState(1);

  const isTracking = context === "seances" || context === "athlete-seances";
  const showAthlete = context === "seances";
  const isObjectifs = context === "objectifs";

  // Filtrage par Search Term
  const filteredPrograms = useMemo(() => {
    if (!searchTerm) return programs;
    const lowerTerm = searchTerm.toLowerCase();
    return programs.filter(p =>
      p.programName.toLowerCase().includes(lowerTerm) ||
      p.objectifName?.toLowerCase().includes(lowerTerm) ||
      p.personName?.toLowerCase().includes(lowerTerm)
    );
  }, [programs, searchTerm]);

  // Pagination logic
  const totalItems = filteredPrograms?.length || 0;
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);

  const paginatedPrograms = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredPrograms.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredPrograms, currentPage]);

  // Reset page when search term changes
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const handleDuplicate = (programId) => {
    if (isObjectifs) return; // Pas de duplication pour les objectifs
    const targetPath = isTracking ? "/seances/new" : "/modeles/new"
    router.push(`${targetPath}?mode=duplicate&duplicateId=${programId}`);
  };

  const handleDelete = (program) => {
    if (onDelete) {
      onDelete(program);
    }
  };

  const handleTransmit = async (program) => {
    const toastId = toast.loading("Transmission du programme en cours...");
    try {
      // 1. Appel de la Server Action pour persister en DB et envoyer l'email
      const result = await transmitSession(program.id);
      if (result.success) {
        toast.success("Programme transmis avec succès", { id: toastId });
        router.refresh();
      } else {
        toast.error("Erreur lors de la transmission : " + result.error, { id: toastId });
      }
    } catch (err) {
      toast.error("Une erreur inattendue est survenue", { id: toastId });
    }
  };

  const getBasePath = (id) => {
    const isAthlete = context === "athlete-seances";
    if (isAthlete) return `/admin/seances/${id}`; // Modifié pour l'interface admin
    if (isObjectifs) return `/admin/objectifs/${id}`;
    // Toujours utiliser /admin/seances pour l'édition, même en mode tracking
    return `/admin/seances/${id}`;
  }

  const handlePrevPage = () => {
    setCurrentPage(prev => Math.max(prev - 1, 1));
  };

  const handleNextPage = () => {
    setCurrentPage(prev => Math.min(prev + 1, totalPages));
  };

  if (!filteredPrograms || filteredPrograms.length === 0) {
    return (
      <div className="text-center py-12 border-2 border-dashed rounded-xl bg-muted/5 text-muted-foreground">
        <p className="text-sm font-medium">Aucun programme ne correspond à votre recherche.</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border shadow-sm bg-card overflow-hidden">
      {/* Version Desktop - Tableau classique (inchangé) */}
      <div className="hidden md:block overflow-x-auto">
        <table className="min-w-full divide-y divide-border">
          <thead className="bg-muted/30">
            <tr>
              {isTracking && !isObjectifs && (
                <th scope="col" className="px-6 py-4 text-center text-xs font-bold text-black uppercase tracking-wider">
                  <Mail size={16} />
                </th>
              )}
              {showAthlete && !isObjectifs && <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-black uppercase tracking-wider">Athlète</th>}
              <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-black uppercase tracking-wider">
                {isObjectifs ? 'Libellé' : 'Nom'}
              </th>
              {isObjectifs ? (
                <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-black uppercase tracking-wider">Description</th>
              ) : (
                <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-black uppercase tracking-wider">Objectifs</th>
              )}
              {isObjectifs ? (
                <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-black uppercase tracking-wider">Séances</th>
              ) : (
                <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-black uppercase tracking-wider">Exercices</th>
              )}
              {showRealisation && !isObjectifs && <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-black uppercase tracking-wider">Réalisation</th>}
              {!isObjectifs && <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-black uppercase tracking-wider">Progression</th>}
              <th scope="col" className="px-6 py-4 text-right text-xs font-bold text-black uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-transparent divide-y divide-border">
            {paginatedPrograms.map((program) => {
              const progression = isObjectifs ? null : getSessionProgression(program.id, program.rawObjectif);

              return (
                <tr key={program.id} className="hover:bg-muted/5 transition-colors group">
                  {isTracking && !isObjectifs && (
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                      <Mail
                        size={16}
                        className={cn(
                          "mx-auto transition-colors duration-300 cursor-pointer",
                          program.status === 'transmis' ? "text-green-500 cursor-not-allowed" :
                          program.status === 'erreur' ? "text-red-500" :
                          "text-amber-500 hover:text-amber-600"
                        )}
                        onClick={program.status === 'transmis' ? undefined : () => handleTransmit(program)}
                        title={
                          program.status === 'transmis' ? "Email déjà envoyé" :
                          program.status === 'erreur' ? "Échec de l'envoi — cliquer pour réessayer" :
                          "Envoyer par email"
                        }
                      />
                    </td>
                  )}
                  {showAthlete && !isObjectifs && (
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-600 italic">
                      {program.personName || '-'}
                    </td>
                  )}
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                    {program.programName}
                  </td>
                  {isObjectifs ? (
                    <td className="px-6 py-4 text-sm text-gray-600 max-w-md truncate">
                      {program.description || '-'}
                    </td>
                  ) : (
                    <td className="px-6 py-4 text-sm text-gray-600 max-w-xs truncate">
                      {program.objectifName || '-'}
                    </td>
                  )}
                  {isObjectifs ? (
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <Calendar size={14} className="text-gray-400" />
                        <span className="text-sm font-medium text-gray-700">
                          {program.sessionsCount || 0} séances
                        </span>
                      </div>
                    </td>
                  ) : (
                    <td className="px-6 py-4 text-sm text-gray-600">
                      <div className="flex flex-wrap gap-1.5">
                        {program.exercises && program.exercises.length > 0 ? (
                          program.exercises.slice(0, 3).map((ex, i) => (
                            <span key={i} className="inline-flex items-center px-2 py-0.5 rounded-full bg-primary/5 text-primary border border-primary/10 text-[10px] font-medium">
                              {ex.name}
                            </span>
                          ))
                        ) : (
                          <span className="text-xs italic text-gray-400">Vide</span>
                        )}
                        {program.exercises?.length > 3 && (
                          <span className="text-[10px] text-gray-500 font-medium flex items-center">
                            +{program.exercises.length - 3}
                          </span>
                        )}
                      </div>
                    </td>
                  )}
                  {showRealisation && !isObjectifs && (
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <Select
                        value={program.realisation || ""}
                        onValueChange={(value) => onRealisationChange?.(program.id, value)}
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
                            {progression} SÉANCES
                          </div>
                      ) : (
                        <span className="text-gray-400 italic text-xs">Hors objectif</span>
                      )}
                    </td>
                  )}
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                    <div className="hidden md:flex justify-end gap-1">
                      {isTracking && !isObjectifs && context !== "athlete-seances" && (
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary hover:bg-primary/5" onClick={() => handleTransmit(program)} title="Transmettre">
                          <Send size={14}/>
                        </Button>
                      )}
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary hover:bg-primary/5" asChild title="Voir">
                        <Link href={`${getBasePath(program.id)}?mode=view&context=${context}`}><Eye size={14}/></Link>
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary hover:bg-primary/5" asChild title="Modifier">
                        <Link href={`${getBasePath(program.id)}?mode=edit&context=${context}`}><Edit2 size={14}/></Link>
                      </Button>
                      {!isObjectifs && (
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary hover:bg-primary/5" onClick={() => handleDuplicate(program.id)} title="Dupliquer">
                          <Copy size={14}/></Button>
                      )}
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/5" onClick={() => handleDelete(program)} title="Supprimer">
                        <Trash2 size={14}/></Button>
                    </div>
                    <div className="md:hidden">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8 p-0">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {isTracking && !isObjectifs && context !== "athlete-seances" && <DropdownMenuItem onSelect={() => handleTransmit(program)}><Send size={14} className="mr-2"/> Transmettre</DropdownMenuItem>}
                          <DropdownMenuItem asChild><Link href={`${getBasePath(program.id)}?mode=view&context=${context}`}><Eye size={14} className="mr-2"/> Voir</Link></DropdownMenuItem>
                          <DropdownMenuItem asChild><Link href={`${getBasePath(program.id)}?mode=edit&context=${context}`}><Edit2 size={14} className="mr-2"/> Modifier</Link></DropdownMenuItem>
                          {!isObjectifs && <DropdownMenuItem onSelect={() => handleDuplicate(program.id)}><Copy size={14} className="mr-2"/> Dupliquer</DropdownMenuItem>}
                          {!isObjectifs && <DropdownMenuSeparator />}
                          <DropdownMenuItem onSelect={() => handleDelete(program)} className="text-red-600 focus:text-red-700 font-medium">
                            <Trash2 size={14} className="mr-2"/> Supprimer
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Version Mobile - Cartes compactes réorganisées */}
      <div className="md:hidden">
        <div className="space-y-4 p-4">
          {paginatedPrograms.map((program) => {
            const progression = isObjectifs ? null : getSessionProgression(program.id, program.rawObjectif);

            return (
              <div key={program.id} className="border rounded-lg p-4 bg-card shadow-sm">
                {/* En-tête avec nom, enveloppe et menu */}
                <div className="flex justify-between items-start mb-4">
                  <h3 className="font-bold text-lg flex-1 pr-2">{program.programName}</h3>
                  <div className="flex items-center gap-2">
                    <Mail
                      size={24}
                      className={cn(
                        "flex-shrink-0 transition-colors duration-300",
                        program.status === 'transmis' ? "text-green-500 cursor-not-allowed" :
                        program.status === 'erreur' ? "text-red-500" :
                        "text-amber-500"
                      )}
                      onClick={program.status === 'transmis' ? undefined : () => handleTransmit(program)}
                      title={
                        program.status === 'transmis' ? "Email déjà envoyé" :
                        program.status === 'erreur' ? "Échec de l'envoi — cliquer pour réessayer" :
                        "Envoyer par email"
                      }
                    />
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-10 w-10 p-0 flex-shrink-0">
                          <MoreVertical className="h-5 w-5" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link href={`${getBasePath(program.id)}?mode=view&context=${context}`}>
                            <Eye size={14} className="mr-2" /> Voir
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href={`${getBasePath(program.id)}?mode=edit&context=${context}`}>
                            <Edit2 size={14} className="mr-2" /> Modifier
                          </Link>
                        </DropdownMenuItem>
                        {!isObjectifs && (
                          <DropdownMenuItem onSelect={() => handleDuplicate(program.id)}>
                            <Copy size={14} className="mr-2" /> Dupliquer
                          </DropdownMenuItem>
                        )}
                        {!isObjectifs && <DropdownMenuSeparator />}
                        <DropdownMenuItem onSelect={() => handleDelete(program)} className="text-red-600 focus:text-red-700 font-medium">
                          <Trash2 size={14} className="mr-2" /> Supprimer
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>

                {/* Athlète - ligne séparée */}
                {showAthlete && !isObjectifs && (
                  <div className="mb-3">
                    <p className="text-sm font-medium text-muted-foreground">Athlète</p>
                    <p className="text-sm">{program.personName || '-'}</p>
                  </div>
                )}

                {/* Objectif - ligne séparée */}
                {!isObjectifs && program.objectifName && (
                  <div className="mb-3">
                    <p className="text-sm font-medium text-muted-foreground">Objectif</p>
                    <p className="text-sm">{program.objectifName}</p>
                  </div>
                )}

                {/* DPD - affichage direct du contenu */}
                {showRealisation && !isObjectifs && program.realisation && (
                  <div className="mb-3">
                    <p className="text-sm font-medium text-muted-foreground">DPD</p>
                    <p className="text-sm">{program.realisation}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Pagination commune */}
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
  );
};

export default ProgramTable;
