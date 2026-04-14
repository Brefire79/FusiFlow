import Modal from './Modal';
import Button from './Button';

interface ConfirmModalProps {
  open: boolean;
  onClose: () => void;
  /** Chamado quando o usuário confirma a ação */
  onConfirm: () => void;
  title: string;
  description?: string;
  confirmLabel?: string;
  confirmVariant?: 'danger' | 'accent';
}

export default function ConfirmModal({
  open,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = 'Confirmar',
  confirmVariant = 'accent',
}: ConfirmModalProps) {
  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose} title={title} maxW="max-w-sm">
      {description && (
        <p className="text-sm text-text-2 leading-relaxed mb-6">{description}</p>
      )}
      <div className="flex justify-end gap-3">
        <Button variant="ghost" onClick={onClose}>
          Cancelar
        </Button>
        <Button variant={confirmVariant} onClick={handleConfirm}>
          {confirmLabel}
        </Button>
      </div>
    </Modal>
  );
}
