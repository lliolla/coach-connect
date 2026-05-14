// frontend/components/seance/programTable.jsx
import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { MoreHorizontal, Eye, Edit2, Copy, Trash2, ChevronLeft, ChevronRight, Mail, Send, Target } from 'lucide-react';
import { toast } from "sonner";
import { cn, getSessionProgression } from "@/lib/utils";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

const ITEMS_PER_PAGE = 10;

const ProgramTable = ({ programs, onDelete, context = "sessions", searchTerm = "" }) => {
  const router = useRouter();
  const [currentPage, setCurrentPage] = useState(1);

  const isTracking = context === "seances" || context === "athlete-seances";
  const showAthlete = context === "seances";

  // Filtrage par Search Term
  const filteredPrograms = useMemo(() => {
    if (!searchTerm) return programs;
    const lowerTerm = searchTerm.toLowerCase();
    return programs.filter(p => 
      p.programName.toLowerCase().includes(lowerTerm) ||
      p.description?.toLowerCase().includes(lowerTerm) ||
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
    const targetPath = isTracking ? "/seances/new" : "/modeles/new"
    router.push(`${targetPath}?mode=duplicate&duplicateId=${programId}`);
  };
  
  const handleDelete = (program) => {
    if (onDelete) {
      onDelete(program);
    }
  };

  const handleTransmit = async (program) => {
    // Appel de la Server Action pour persister en DB
    const result = await transmitSession(program.id);
    if (result.success) {
      toast.success("Programme transmis avec succès");
      // Note: Ici, il faudrait idéalement rafraîchir la liste 
      // ou mettre à jour l'état local si getSessions est appelé
      router.refresh(); 
    } else {
      toast.error("Erreur lors de la transmission");
    }
  };
