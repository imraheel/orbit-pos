import * as React from 'react'
import { cn } from '@/lib/utils'
import { ImagePlus, X, Loader2 } from 'lucide-react'

interface ImageUploadProps {
  value: string | null
  onChange: (value: string | null) => void
  className?: string
}

export function ImageUpload({ value, onChange, className }: ImageUploadProps) {
  const [loading, setLoading] = React.useState(false)
  const [preview, setPreview] = React.useState<string | null>(value)

  React.useEffect(() => {
    loadImage(value || '')
  }, [value])

  const loadImage = async (path: string) => {
    if (!path) {
      setPreview(null)
      return
    }

    if (path.startsWith('temp:')) {
      const [, base64, extension] = path.split(':')
      setPreview(`data:image/${extension};base64,${base64}`)
      return
    }

    try {
      const base64 = await window.electronAPI.getProductImage(path)
      setPreview(base64)
    } catch {
      setPreview(null)
    }
  }

  const handleSelectImage = async () => {
    setLoading(true)
    try {
      const result = await window.electronAPI.openImageDialog()
      if (result) {
        const tempBase64 = `data:image/${result.extension};base64,${result.base64}`
        setPreview(tempBase64)
        onChange(`temp:${result.base64}:${result.extension}`)
      }
    } catch (err) {
      console.error('Failed to select image:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleRemove = () => {
    setPreview(null)
    onChange(null)
  }

  return (
    <div className={cn('flex flex-col gap-2', className)}>
      {preview ? (
        <div className="relative w-32 h-32 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700">
          <img
            src={preview}
            alt="Product"
            className="w-full h-full object-cover"
          />
          <button
            type="button"
            onClick={handleRemove}
            className="absolute top-1 right-1 p-1 rounded-full bg-red-500 text-white hover:bg-red-600 transition-colors"
          >
            <X size={14} />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={handleSelectImage}
          disabled={loading}
          className="w-32 h-32 rounded-lg border-2 border-dashed border-slate-300 dark:border-slate-600 flex flex-col items-center justify-center gap-2 text-slate-500 hover:border-blue-500 hover:text-blue-500 transition-colors disabled:opacity-50"
        >
          {loading ? (
            <Loader2 className="w-6 h-6 animate-spin" />
          ) : (
            <>
              <ImagePlus className="w-8 h-8" />
              <span className="text-xs">Add Image</span>
            </>
          )}
        </button>
      )}
    </div>
  )
}
