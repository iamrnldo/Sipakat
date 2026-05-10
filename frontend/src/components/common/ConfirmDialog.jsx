import { HiExclamationTriangle } from "react-icons/hi2";
import Modal from "./Modal";

export default function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  loading,
}) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="" size="sm">
      <div className="p-6 text-center">
        <div className="mx-auto h-14 w-14 rounded-full bg-red-100 flex items-center justify-center mb-4">
          <HiExclamationTriangle className="h-7 w-7 text-red-600" />
        </div>
        <h3 className="text-lg font-semibold text-slate-800 mb-2">
          {title || "Konfirmasi"}
        </h3>
        <p className="text-sm text-slate-500 mb-6">
          {message || "Apakah Anda yakin?"}
        </p>
        <div className="flex gap-3 justify-center">
          <button onClick={onClose} className="btn-secondary px-6">
            Batal
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="btn-danger px-6"
          >
            {loading ? "Menghapus..." : "Ya, Hapus"}
          </button>
        </div>
      </div>
    </Modal>
  );
}
