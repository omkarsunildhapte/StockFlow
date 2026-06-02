"use client";

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = "Delete",
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onCancel} />
      <div className="relative bg-white rounded-xl shadow-xl w-full max-w-sm mx-4 p-6 space-y-4">
        <h2 className="text-base font-semibold text-gray-900">{title}</h2>
        <p className="text-sm text-gray-500">{message}</p>
        <div className="flex justify-end gap-3 pt-1">
          <button
            onClick={onCancel}
            className="text-sm text-gray-600 hover:text-gray-800 font-medium px-4 py-2 rounded-lg border border-gray-200 hover:bg-gray-50 transition"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="text-sm bg-red-600 hover:bg-red-700 text-white font-medium px-4 py-2 rounded-lg transition"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
