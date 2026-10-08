import type { AnalyticsEvent, Camera } from '@/types'

export function exportEventsToCSV(events: AnalyticsEvent[]): void {
  const headers = ['ID', 'Camera Name', 'Severity', 'Message', 'Timestamp', 'Acknowledged']
  const rows = events.map((e) => [
    e.id,
    `"${e.cameraName || e.cameraId}"`,
    e.severity,
    `"${(e.message || '').replace(/"/g, '""')}"`,
    e.timestamp,
    e.acknowledged ? 'TRUE' : 'FALSE',
  ])

  const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n')
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `visionx-events-${Date.now()}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

export function exportCamerasSummaryJSON(cameras: Camera[]): void {
  const jsonStr = JSON.stringify({ exported_at: new Date().toISOString(), cameras }, null, 2)
  const blob = new Blob([jsonStr], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `visionx-camera-topology-${Date.now()}.json`
  a.click()
  URL.revokeObjectURL(url)
}
