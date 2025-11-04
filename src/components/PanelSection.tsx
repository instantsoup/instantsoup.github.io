import { useState, type ReactNode } from 'react'

type Props = {
  title: string
  defaultOpen?: boolean
  children: ReactNode
}

export function PanelSection({ title, defaultOpen = false, children }: Props) {
  const [open, setOpen] = useState(defaultOpen)

  return (
    <div className="panel">
      <button
        type="button"
        className={`panel__header ${open ? 'panel__header--open' : ''}`}
        onClick={() => setOpen(o => !o)}
        aria-expanded={open}
      >
        {title}
      </button>
      {open && <div className="panel__content">{children}</div>}
    </div>
  )
}