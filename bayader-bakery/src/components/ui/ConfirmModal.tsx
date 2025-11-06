import React from 'react'

interface Props {
  open: boolean
  title?: string
  message?: string
  confirmText?: string
  cancelText?: string
  onConfirm: () => void
  onCancel: () => void
  loading?: boolean
}

const ConfirmModal: React.FC<Props> = ({ open, title = 'Confirm', message = 'Are you sure?', confirmText = 'Yes', cancelText = 'Cancel', onConfirm, onCancel, loading }) => {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h3 className="text-lg font-medium text-[#5E372E] mb-2">{title}</h3>
        <p className="text-sm text-gray-600 mb-4">{message}</p>

        <div className="mt-4 flex justify-end gap-3">
          <button type="button" onClick={onCancel} className="px-4 py-2 rounded border" disabled={loading}>{cancelText}</button>
          <button type="button" onClick={onConfirm} className="px-4 py-2 bg-red-600 text-white rounded" disabled={loading}>{loading ? 'Deleting...' : confirmText}</button>
        </div>
      </div>
    </div>
  )
}

export default ConfirmModal
