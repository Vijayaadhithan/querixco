import { useEffect, useRef, type ReactNode } from "react";

export function PortalDialog({
  children,
  busy,
  onClose,
}: {
  children: ReactNode;
  busy: boolean;
  onClose: () => void;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const dialog = ref.current!;
    dialog.showModal();
    return () => dialog.close();
  }, []);
  return (
    <dialog
      ref={ref}
      className="portal-dialog"
      aria-labelledby="portal-dialog-title"
      onCancel={(event) => {
        event.preventDefault();
        if (!busy) onClose();
      }}
    >
      {children}
    </dialog>
  );
}
