import { Button } from "@/components/ui/button";
import { StatusModal } from "@/components/modal/status-modal";

export function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = "Confirmer",
  cancelText = "Annuler",
  variant = "default",
}) {
  return (
    <StatusModal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      message={description}
      type={variant === "destructive" ? "error" : "info"}
    >
      <div className="mt-4 flex justify-end gap-2">
        <Button variant="outline" onClick={onClose}>
          {cancelText}
        </Button>
        <Button
          variant={variant === "destructive" ? "destructive" : "default"}
          onClick={onConfirm}
        >
          {confirmText}
        </Button>
      </div>
    </StatusModal>
  );
}