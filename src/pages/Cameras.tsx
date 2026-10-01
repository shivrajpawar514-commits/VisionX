import { useEffect, useState } from 'react'
import { TopBar } from '@/components/layout/TopBar'
import { Panel } from '@/components/Panel'
import { api } from '@/lib/api'
import type { Camera, CameraStatus, ModelInfo } from '@/types'

const statusStyle: Record<CameraStatus, string> = {
  online: 'text-live border-live/40 bg-live/10',
  degraded: 'text-warn border-warn/40 bg-warn/10',
  offline: 'text-muted border-line bg-raised',
}

export function Cameras() {
  const [cameras, setCameras] = useState<Camera[]>([])
  const [models, setModels] = useState<ModelInfo[]>([])

  useEffect(() => {
    api.getCameras().then(setCameras)
    api.getModels().then(setModels)
  }, [])

  async function changeModel(cameraId: string, modelId: string) {
    setCameras((cams) =>
      cams.map((c) => (c.id === cameraId ? { ...c, activeModel: models.find((m) => m.id === modelId)?.name ?? c.activeModel } : c)),
    )
    await api.setActiveModel(cameraId, modelId)
  }

  return (
    <>
      <TopBar title="Cameras" subtitle="Stream health, source configuration and model assignment" />
      <div className="flex-1 overflow-y-auto p-6">
        <div className="grid grid-cols-2 gap-4">
          {cameras.map((cam) => (
            <Panel
              key={cam.id}
              label={cam.name}
              action={
                <span className={`rounded-full border px-2 py-0.5 text-[11px] capitalize ${statusStyle[cam.status]}`}>
                  {cam.status}
                </span>
              }
            >
              <dl className="grid grid-cols-2 gap-y-2.5 text-sm">
                <dt className="text-muted">Location</dt>
                <dd className="text-right text-ink">{cam.location}</dd>
                <dt className="text-muted">Source</dt>
                <dd className="text-right text-ink uppercase">{cam.sourceType}</dd>
                <dt className="text-muted">Resolution</dt>
                <dd className="text-right font-mono text-ink">{cam.resolution}</dd>
                <dt className="text-muted">FPS</dt>
                <dd className="text-right font-mono tabular text-ink">{cam.fps}</dd>
                <dt className="text-muted">Codec</dt>
                <dd className="text-right font-mono text-ink">{cam.codec}</dd>
                <dt className="text-muted">Dropped frames</dt>
                <dd className={`text-right font-mono tabular ${cam.droppedFrames > 30 ? 'text-warn' : 'text-ink'}`}>
                  {cam.droppedFrames}
                </dd>
                <dt className="text-muted">Latency</dt>
                <dd className="text-right font-mono tabular text-ink">{cam.latencyMs} ms</dd>
              </dl>

              <div className="mt-4 border-t border-line pt-3">
                <label className="mb-1.5 block text-xs text-muted">Active model</label>
                <select
                  value={models.find((m) => m.name === cam.activeModel)?.id ?? ''}
                  onChange={(e) => changeModel(cam.id, e.target.value)}
                  className="w-full rounded border border-line bg-raised px-2.5 py-1.5 text-sm text-ink"
                >
                  {models.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name} · {m.runtime}
                    </option>
                  ))}
                </select>
              </div>
            </Panel>
          ))}
        </div>
      </div>
    </>
  )
}
