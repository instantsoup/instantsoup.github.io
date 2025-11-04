import React from 'react'

export function DropZone({ onFile }: { onFile: (f: File) => Promise<void> | void }) {
  const onDrop: React.DragEventHandler<HTMLDivElement> = async (e) => {
    e.preventDefault()
    const f = e.dataTransfer.files?.[0]
    if (f) await onFile(f)
  }
  const onDragOver: React.DragEventHandler<HTMLDivElement> = (e) => e.preventDefault()

  return (
    <div onDrop={onDrop} onDragOver={onDragOver}
      style={{ border:'1px dashed #bbb', borderRadius:12, padding:12, marginBottom:12, background:'#fafafa' }}>
      Drop a character JSON here to import
    </div>
  )
}
