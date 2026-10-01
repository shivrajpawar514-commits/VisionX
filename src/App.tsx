import { HashRouter, Routes, Route } from 'react-router-dom'
import { AppShell } from '@/components/layout/AppShell'
import { Dashboard } from '@/pages/Dashboard'
import { EventsPage } from '@/pages/EventsPage'
import { Cameras } from '@/pages/Cameras'
import { Models } from '@/pages/Models'
import { SystemHealth } from '@/pages/SystemHealth'

export default function App() {
  return (
    <HashRouter>
      <AppShell>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/events" element={<EventsPage />} />
          <Route path="/cameras" element={<Cameras />} />
          <Route path="/models" element={<Models />} />
          <Route path="/health" element={<SystemHealth />} />
        </Routes>
      </AppShell>
    </HashRouter>
  )
}
