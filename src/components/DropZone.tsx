import React from 'react';

export function DropZone({ onFile }: { onFile: (f: File) => Promise<void> | void }) {
  const onDrop: React.DragEventHandler<HTMLDivElement> = async (e) => {
    e.preventDefault();
    const f = e.dataTransfer.files?.[0];
    if (f) await onFile(f);
  };

  const onDragOver: React.DragEventHandler<HTMLDivElement> = (e) => e.preventDefault();

  return (
    <div
      onDrop={onDrop}
      onDragOver={onDragOver}
      className="border-dashed rounded-12 p-3 mb-12 bg-faint text-center text-muted"
    >
      Drop a character JSON here to import
    </div>
  );
}
