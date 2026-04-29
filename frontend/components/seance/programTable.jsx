// frontend/components/seance/programTable.jsx
import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { MoreHorizontal } from 'lucide-react'; // Utilisation de l'icône MoreHorizontal pour les trois points

// Assurez-vous que ces composants shadcn/ui sont disponibles et importés correctement
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button"; // Pour le bouton déclencheur du menu

const ProgramTable = ({ programs, onDelete }) => {
  const router = useRouter(); // Importer useRouter

  const handleDuplicate = (programId) => {
    router.push(`/sessions/new?mode=duplicate&duplicateId=${programId}`);
  };
  
  const handleDelete = (program) => {
    if (onDelete) {
      onDelete(program);
    } else {
      console.log("Supprimer programme:", program.id);
    }
  };

  if (!programs || programs.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        Aucun programme trouvé.
      </div>
    );
  }

  return (
    <div className="rounded-md border overflow-hidden">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              Nom de la personne
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              Nom du programme
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              Exercices (Miniature)
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {programs.map((program) => (
            <tr key={program.id}>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                {program.personName}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {program.programName}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 flex items-center">
                {program.thumbnailUrl ? (
                  <img src={program.thumbnailUrl} alt={`Miniature de ${program.programName}`} className="h-8 w-8 rounded-md mr-2 object-cover" />
                ) : (
                  <div className="h-8 w-8 rounded-md bg-gray-200 mr-2 flex items-center justify-center text-xs text-gray-500">
                    N/A
                  </div>
                )}
                {program.numberOfExercises} exo(s)
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8 p-0">
                      <span className="sr-only">Ouvrir le menu des actions</span>
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem asChild>
                      <Link href={`/sessions/${program.id}?mode=view`}>
                        Voir
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href={`/sessions/${program.id}?mode=edit`}>
                        Modifier
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem onSelect={() => handleDuplicate(program.id)}>
                      Dupliquer
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      onSelect={() => handleDelete(program)} 
                      className="text-red-600 focus:text-red-700"
                    >
                      Supprimer
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ProgramTable;
