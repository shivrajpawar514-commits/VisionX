import type { ReactNode } from 'react'

export function Panel({
  label,
  action,
  children,
  className = '',
}: {
  label: string
  action?: ReactNode
  children: ReactNode
  className?: string
}) {
  return (
    <section className={`flex flex-col rounded border border-line bg-panel ${className}`}>
      <div className="flex items-center justify-between border-b border-line px-4 py-2.5">
        <span className="font-mono text-xs text-muted">{label}</span>
        {action}
      </div>
      <div className="flex-1 p-4">{children}</div>
    </section>
  )
}
