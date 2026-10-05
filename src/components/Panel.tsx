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
    <section className={`glass-panel glass-panel-hover flex flex-col rounded-xl overflow-hidden ${className}`}>
      <div className="flex items-center justify-between border-b border-line/80 px-4 py-3 bg-raised/40">
        <div className="flex items-center gap-2">
          <div className="h-1.5 w-1.5 rounded-full bg-cyber" />
          <span className="font-mono text-xs font-semibold tracking-wider text-muted-bright uppercase">{label}</span>
        </div>
        {action}
      </div>
      <div className="flex-1 p-4">{children}</div>
    </section>
  )
}
