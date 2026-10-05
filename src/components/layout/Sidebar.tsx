import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  ShieldAlert,
  Camera,
  Cpu,
  Activity,
  ChevronLeft,
  ChevronRight,
  Radio,
  Server,
  Zap,
} from 'lucide-react'

const links = [
  { to: '/', label: 'Overview', icon: LayoutDashboard },
  { to: '/events', label: 'Events & Alerts', icon: ShieldAlert, badge: '3' },
  { to: '/cameras', label: 'Cameras', icon: Camera, badge: '4' },
  { to: '/models', label: 'Models & AI', icon: Cpu },
  { to: '/health', label: 'System Health', icon: Activity },
]

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false)

  return (
    <aside
      className={`relative flex h-full shrink-0 flex-col border-r border-line bg-panel/90 backdrop-blur-xl transition-all duration-300 ${
        collapsed ? 'w-16' : 'w-60'
      }`}
    >
      {/* Brand Header */}
      <div className="flex h-16 items-center justify-between border-b border-line px-4">
        {!collapsed ? (
          <div className="flex items-center gap-2.5">
            <div className="relative flex h-8 w-8 items-center justify-center rounded-lg border border-live/40 bg-live/10 text-live shadow-glow-live">
              <Zap className="h-4 w-4" />
              <span className="absolute -right-0.5 -top-0.5 flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-live opacity-75"></span>
                <span className="relative inline-flex h-2 w-2 rounded-full bg-live"></span>
              </span>
            </div>
            <div className="flex flex-col">
              <span className="font-mono text-sm font-bold tracking-wider text-ink uppercase">
                Vision<span className="text-cyber">X</span>
              </span>
              <span className="font-mono text-[10px] tracking-tight text-muted">
                Edge Intelligence v0.1
              </span>
            </div>
          </div>
        ) : (
          <div className="mx-auto flex h-8 w-8 items-center justify-center rounded-lg border border-live/40 bg-live/10 text-live">
            <Zap className="h-4 w-4" />
          </div>
        )}

        <button
          onClick={() => setCollapsed(!collapsed)}
          className="flex h-6 w-6 items-center justify-center rounded border border-line bg-raised text-muted hover:border-cyber/40 hover:text-ink transition-colors"
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <ChevronRight className="h-3.5 w-3.5" /> : <ChevronLeft className="h-3.5 w-3.5" />}
        </button>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 space-y-1.5 px-2.5 py-4">
        {links.map((l) => {
          const Icon = l.icon
          return (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.to === '/'}
              className={({ isActive }) =>
                `group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-cyber/10 border border-cyber/30 text-cyber shadow-glow-cyber'
                    : 'text-muted hover:bg-raised/80 hover:text-ink border border-transparent'
                }`
              }
              title={collapsed ? l.label : undefined}
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <span className="absolute left-0 top-2 bottom-2 w-1 rounded-r-full bg-cyber" />
                  )}
                  <Icon className={`h-4 w-4 shrink-0 transition-transform group-hover:scale-110 ${isActive ? 'text-cyber' : 'text-muted group-hover:text-ink'}`} />
                  {!collapsed && (
                    <span className="flex-1 tracking-wide">{l.label}</span>
                  )}
                  {!collapsed && l.badge && (
                    <span className={`rounded-full px-2 py-0.5 font-mono text-[10px] ${l.badge === '3' ? 'bg-alert/20 text-alert border border-alert/30' : 'bg-void text-muted border border-line'}`}>
                      {l.badge}
                    </span>
                  )}
                </>
              )}
            </NavLink>
          )
        })}
      </nav>

      {/* Node Observability Footer */}
      {!collapsed && (
        <div className="border-t border-line p-3 m-2.5 rounded-lg border bg-void/60 text-xs">
          <div className="flex items-center justify-between pb-2 border-b border-line/60">
            <div className="flex items-center gap-1.5 font-mono text-[11px] text-muted">
              <Server className="h-3 w-3 text-live" />
              <span>Node-Alpha</span>
            </div>
            <span className="flex items-center gap-1 font-mono text-[10px] text-live">
              <Radio className="h-3 w-3 animate-pulse" />
              <span>ONLINE</span>
            </span>
          </div>
          <div className="mt-2 space-y-1 font-mono text-[10px] text-muted">
            <div className="flex justify-between">
              <span>TensorRT</span>
              <span className="text-cyber">FP16 Active</span>
            </div>
            <div className="flex justify-between">
              <span>Streams</span>
              <span className="text-ink">4 Online</span>
            </div>
          </div>
        </div>
      )}
    </aside>
  )
}
