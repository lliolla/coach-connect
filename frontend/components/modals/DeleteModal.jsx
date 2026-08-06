import { useState } from "react";
import { Button } from "@/components/ui/button";
import { StatusModal } from "@/components/modal/status-modal";
import { ConfirmationModal } from "@/components/confirmation-modal";
import { SuccessModal } from "@/components/success-modal";

export function DeleteModal({
  isOpen,
  onClose,
  onDelete,
  title = "Supprimer",
  description = "Êtes-vous sûr de vouloir supprimer cet élément ? Cette action est irréversible.",
  successMessage = "L'élément a été supprimé avec succès.",
}) {
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isSuccessOpen, setIsSuccessOpen] = useState(false);

  const handleConfirm = () => {
    setIsConfirmOpen(false);
    onDelete();
    setIsSuccessOpen(true);
  };

  const handleSuccessClose = () => {
    setIsSuccessOpen(false);
    onClose();
  };

  return (
    <>
      <ConfirmationModal
        isOpen={isOpen}
        onClose={onClose}
        onConfirm={() => setIsConfirmOpen(true)}
        title={title}
        description={description}
        confirmText="Supprimer"
        variant="destructive"
      />

      <StatusModal
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        title="Confirmation de suppression"
        message="Voulez-vous vraiment supprimer cet élément ?"
        type="error"
      >
        <div className="mt-4 flex justify-end gap-2">
          <Button variant="outline" onClick={() => setIsConfirmOpen(false)}>
            Annuler
          </Button>
          <Button variant="destructive" onClick={handleConfirm}>
            Oui, supprimer
          </Button>
        </div>
      </StatusModal>

      <SuccessModal
        isOpen={isSuccessOpen}
        onClose={handleSuccessClose}
        title="Suppression réussie"
        description={successMessage}
      />
    </>
  );
}