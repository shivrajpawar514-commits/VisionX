import { NavLink } from 'react-router-dom'

const links = [
  { to: '/', label: 'Overview', glyph: '◱' },
  { to: '/events', label: 'Events', glyph: '▲' },
  { to: '/cameras', label: 'Cameras', glyph: '◉' },
  { to: '/models', label: 'Models', glyph: '◈' },
  { to: '/health', label: 'System Health', glyph: '⬡' },
]

export function Sidebar() {
  return (
    <aside className="flex h-full w-56 shrink-0 flex-col border-r border-line bg-panel">
      <div className="flex items-center gap-2 border-b border-line px-5 py-5">
        <div className="h-2 w-2 rounded-full bg-live shadow-[0_0_8px_2px_rgba(61,220,151,0.5)]" />
        <span className="font-mono text-sm tracking-tight text-ink">VisionX</span>
      </div>
      <nav className="flex-1 space-y-0.5 px-2 py-4">
        {links.map((l) => (
          <NavLink
            key={l.to}
            to={l.to}
            end={l.to === '/'}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded px-3 py-2 text-sm transition-colors ${
                isActive
                  ? 'bg-raised text-ink'
                  : 'text-muted hover:bg-raised/60 hover:text-ink'
              }`
            }
          >
            <span className="w-4 text-center font-mono text-xs">{l.glyph}</span>
            {l.label}
          </NavLink>
        ))}
      </nav>
      <div className="border-t border-line px-5 py-4 text-xs text-muted">
        <div className="flex justify-between">
          <span>Build</span>
          <span className="font-mono">v0.1.0-dev</span>
        </div>
        <div className="mt-1 flex justify-between">
          <span>Backend</span>
          <span className="font-mono text-warn">mock</span>
        </div>
      </div>
    </aside>
  )
}
