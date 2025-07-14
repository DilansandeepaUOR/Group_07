import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogOverlay,
  DialogClose,
} from "./dialog";

/**
 * ConfirmDialog - A reusable confirmation dialog/modal.
 *
 * Props:
 * - open: boolean (controls dialog visibility)
 * - title: string (dialog title)
 * - description: string (dialog body text)
 * - confirmLabel: string (confirm button text)
 * - cancelLabel: string (cancel button text)
 * - onConfirm: function (called when confirm is clicked)
 * - onCancel: function (called when cancel is clicked or dialog is closed)
 * - loading: boolean (optional, disables buttons if true)
 */
const ConfirmDialog = ({
  open,
  title = "Confirm",
  description = "Are you sure?",
  confirmLabel = "Yes, Confirm",
  cancelLabel = "Cancel",
  onConfirm,
  onCancel,
  type="confirm",
  loading = false,
}) => {
  return (
    <Dialog open={open} onOpenChange={v => { if (!v) onCancel?.(); }}>
      <DialogOverlay className={'backdrop-blur-sm bg-black/30 z-[9999] pointer-events-auto'}/>
      <DialogContent className="max-w-sm w-full p-6 " style={{ zIndex: 10001 }}>
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold mb-4">{title}</DialogTitle>
        </DialogHeader>
        <div className="mb-6 text-sm text-gray-700">{description}</div>
        <DialogFooter className="flex justify-end gap-2">
          <button
            type="button"
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
            onClick={onCancel}
            disabled={loading}
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            className={`px-4 py-2 rounded transition-colors ${type === 'cancel' ? 'bg-red-600 text-white hover:bg-red-800' : 'px-4 py-2 bg-[#028478] text-white rounded hover:bg-[#026e64]'}`}
            onClick={onConfirm}
            disabled={loading}
          >
            {confirmLabel}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ConfirmDialog; 