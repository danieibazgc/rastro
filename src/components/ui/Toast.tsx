'use client'
// src/components/ui/Toast.tsx
// Toast de notificación simple para feedback de formularios
import { useEffect, useState } from 'react'
import { CheckCircle, XCircle, X } from 'lucide-react'

export type ToastType = 'success' | 'error'

interface ToastProps {
  message: string
  type: ToastType
  onClose: () => void
  duration?: number
}

export default function Toast({ message, type, onClose, duration = 4000 }: ToastProps) {
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false)
      setTimeout(onClose, 300)
    }, duration)
    return () => clearTimeout(timer)
  }, [duration, onClose])

  return (
    <div
      className={`
        fixed bottom-6 right-6 z-[9999] flex items-center gap-3 px-4 py-3 rounded-xl
        border shadow-glass backdrop-blur-sm max-w-sm
        transition-all duration-300
        ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}
        ${type === 'success'
          ? 'bg-slate-900/90 border-suministro/30 text-suministro'
          : 'bg-slate-900/90 border-rescate/30 text-rescate'
        }
      `}
    >
      {type === 'success' ? (
        <CheckCircle size={18} className="shrink-0" />
      ) : (
        <XCircle size={18} className="shrink-0" />
      )}
      <p className="text-sm text-white">{message}</p>
      <button
        onClick={() => { setVisible(false); setTimeout(onClose, 300) }}
        className="ml-2 text-slate-500 hover:text-white transition-colors"
        aria-label="Cerrar notificación"
      >
        <X size={14} />
      </button>
    </div>
  )
}
