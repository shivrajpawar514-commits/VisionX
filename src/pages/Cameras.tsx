import { useEffect, useState } from 'react'
import { TopBar } from '@/components/layout/TopBar'
import { Panel } from '@/components/Panel'
import { LiveFeed } from '@/components/LiveFeed'
import { api } from '@/lib/api'
import type { Camera, CameraStatus, ModelInfo } from '@/types'
import { Radio, Sliders, ShieldCheck, Cpu, HardDrive, Eye } from 'lucide-react'

const statusStyle: Record<CameraStatus, string> = {
  online: 'text-live border-live/40 bg-live/10 shadow-glow-live',
  degraded: 'text-warn border-warn/40 bg-warn/10',
  offline: 'text-muted border-line bg-raised',
}

export function Cameras() {
  const [cameras, setCameras] = useState<Camera[]>([])
  const [models, setModels] = useState<ModelInfo[]>([])
  const [activeCamTab, setActiveCamTab] = useState<string | null>(null)

  useEffect(() => {
    api.getCameras().then((cams) => {
      setCameras(cams)
      if (cams.length > 0) setActiveCamTab(cams[0].id)
    })
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
      <TopBar title="Camera Management" subtitle="RTSP ingestion streams, resolution specs, tripwires & model assignments" />
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Stream Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {cameras.map((cam) => (
            <Panel
              key={cam.id}
              label={cam.name}
              action={
                <span className={`rounded-full border px-2.5 py-0.5 font-mono text-[10px] uppercase font-semibold ${statusStyle[cam.status]}`}>
                  {cam.status}
                </span>
              }
            >
              <div className="space-y-4">
                {/* Live Stream Canvas Preview */}
                <div className="overflow-hidden rounded-lg border border-line bg-void">
                  <LiveFeed cameraName={cam.name} />
                </div>

                {/* Technical Specs DL */}
                <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
                  <dt className="text-muted">Location Zone</dt>
                  <dd className="text-right text-ink font-medium">{cam.location}</dd>
                  <dt className="text-muted">Ingestion Source</dt>
                  <dd className="text-right font-mono text-cyber uppercase">{cam.sourceType}</dd>
                  <dt className="text-muted">Native Resolution</dt>
                  <dd className="text-right font-mono text-ink">{cam.resolution}</dd>
                  <dt className="text-muted">Target Frame Rate</dt>
                  <dd className="text-right font-mono text-live font-semibold">{cam.fps} FPS</dd>
                  <dt className="text-muted">Stream Codec</dt>
                  <dd className="text-right font-mono text-ink uppercase">{cam.codec}</dd>
                  <dt className="text-muted">Frame Drops</dt>
                  <dd className={`text-right font-mono ${cam.droppedFrames > 30 ? 'text-warn' : 'text-muted'}`}>
                    {cam.droppedFrames} frames
                  </dd>
                  <dt className="text-muted">Inference Latency</dt>
                  <dd className="text-right font-mono text-cyber">{cam.latencyMs} ms</dd>
                </dl>

                {/* Active Model Assignment */}
                <div className="border-t border-line pt-3">
                  <label className="mb-1.5 flex items-center justify-between text-xs font-mono text-muted">
                    <span className="flex items-center gap-1.5">
                      <Cpu className="h-3.5 w-3.5 text-cyber" />
                      <span>Assigned AI Model</span>
                    </span>
                  </label>
                  <select
                    value={models.find((m) => m.name === cam.activeModel)?.id ?? ''}
                    onChange={(e) => changeModel(cam.id, e.target.value)}
                    className="w-full rounded-lg border border-line bg-void px-3 py-2 text-xs font-mono text-ink focus:border-cyber focus:outline-none"
                  >
                    {models.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.name} · {m.runtime} ({m.precision})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </Panel>
          ))}
        </div>
      </div>
    </>
  )
}
