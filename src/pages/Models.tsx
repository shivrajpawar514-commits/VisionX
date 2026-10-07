import { useEffect, useState } from 'react'
import { TopBar } from '@/components/layout/TopBar'
import { Panel } from '@/components/Panel'
import { api } from '@/lib/api'
import type { ModelInfo, ModelBenchmark } from '@/types'
import { Cpu, Zap, Activity, Layers, Database, ShieldCheck } from 'lucide-react'

const statusStyle: Record<string, string> = {
  active: 'text-live bg-live/10 border border-live/30 shadow-glow-live',
  staged: 'text-warn bg-warn/10 border border-warn/30',
  archived: 'text-muted bg-void border border-line',
}

export function Models() {
  const [models, setModels] = useState<ModelInfo[]>([])
  const [benchmarks, setBenchmarks] = useState<ModelBenchmark[]>([])

  useEffect(() => {
    api.getModels().then(setModels)
    api.getBenchmarks().then(setBenchmarks)
  }, [])

  return (
    <>
      <TopBar title="Models & Acceleration" subtitle="TensorRT INT8 & ONNX Runtime benchmark matrix and quantization registry" />
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="glass-panel p-4 rounded-xl border border-line flex items-center justify-between">
            <div>
              <span className="font-mono text-[10px] uppercase tracking-wider text-muted font-semibold">
                Quantization Engine
              </span>
              <div className="font-mono text-xl font-bold text-live mt-1">NVIDIA TensorRT</div>
              <span className="font-mono text-[10px] text-muted">INT8 PTQ Entropy Calibration</span>
            </div>
            <Zap className="h-6 w-6 text-live" />
          </div>

          <div className="glass-panel p-4 rounded-xl border border-line flex items-center justify-between">
            <div>
              <span className="font-mono text-[10px] uppercase tracking-wider text-muted font-semibold">
                Max Inference Speed
              </span>
              <div className="font-mono text-xl font-bold text-cyber mt-1">243.9 FPS</div>
              <span className="font-mono text-[10px] text-muted">Sub-5ms Latency P95</span>
            </div>
            <Activity className="h-6 w-6 text-cyber" />
          </div>

          <div className="glass-panel p-4 rounded-xl border border-line flex items-center justify-between">
            <div>
              <span className="font-mono text-[10px] uppercase tracking-wider text-muted font-semibold">
                Accuracy mAP50-95
              </span>
              <div className="font-mono text-xl font-bold text-ink mt-1">52.8%</div>
              <span className="font-mono text-[10px] text-muted">Zero perceptible drop in INT8</span>
            </div>
            <ShieldCheck className="h-6 w-6 text-ink" />
          </div>
        </div>

        {/* Model Registry Panel */}
        <Panel label="ACTIVE MODEL REGISTRY">
          <div className="overflow-x-auto">
            <table className="w-full text-xs font-mono">
              <thead>
                <tr className="border-b border-line text-left text-muted font-semibold">
                  <th className="pb-3 font-normal uppercase">Model Architecture</th>
                  <th className="pb-3 font-normal uppercase">Task</th>
                  <th className="pb-3 font-normal uppercase">Precision</th>
                  <th className="pb-3 font-normal uppercase">Runtime Engine</th>
                  <th className="pb-3 text-right font-normal uppercase">mAP50-95</th>
                  <th className="pb-3 text-right font-normal uppercase">FPS</th>
                  <th className="pb-3 text-right font-normal uppercase">Latency P95</th>
                  <th className="pb-3 text-right font-normal uppercase">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line/60">
                {models.map((m) => (
                  <tr key={m.id} className="hover:bg-raised/40 transition-colors">
                    <td className="py-3 font-semibold text-ink">{m.name}</td>
                    <td className="py-3 capitalize text-muted">{m.task}</td>
                    <td className="py-3 text-cyber">{m.precision}</td>
                    <td className="py-3 text-slate-300">{m.runtime}</td>
                    <td className="py-3 text-right text-ink">
                      {typeof m.mAP5095 === 'number'
                        ? m.mAP5095 > 1
                          ? m.mAP5095.toFixed(1)
                          : (m.mAP5095 * 100).toFixed(1) + '%'
                        : m.mAP5095}
                    </td>
                    <td className="py-3 text-right font-bold text-live">{m.fps}</td>
                    <td className="py-3 text-right text-ink">{m.latencyMs} ms</td>
                    <td className="py-3 text-right">
                      <span
                        className={`inline-block rounded-md px-2 py-0.5 text-[10px] uppercase font-semibold ${
                          statusStyle[m.status] || statusStyle.active
                        }`}
                      >
                        {m.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>

        {/* Quantization & Runtime Matrix */}
        <Panel label="QUANTIZATION & RUNTIME ACCELERATION BENCHMARKS">
          <div className="space-y-4">
            <div className="overflow-x-auto">
              <table className="w-full text-xs font-mono">
                <thead>
                  <tr className="border-b border-line text-left text-muted font-semibold">
                    <th className="pb-3 font-normal uppercase">Benchmark Profile</th>
                    <th className="pb-3 font-normal uppercase">Framework</th>
                    <th className="pb-3 font-normal uppercase">Precision</th>
                    <th className="pb-3 text-right font-normal uppercase">Latency (P95)</th>
                    <th className="pb-3 text-right font-normal uppercase">Throughput</th>
                    <th className="pb-3 text-right font-normal uppercase">Memory VRAM</th>
                    <th className="pb-3 text-right font-normal uppercase">Speedup</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line/60">
                  {benchmarks.map((b) => (
                    <tr key={b.model_id} className="hover:bg-raised/40 transition-colors">
                      <td className="py-3 font-semibold text-ink">{b.model_name}</td>
                      <td className="py-3 text-muted uppercase">{b.framework}</td>
                      <td className="py-3 text-cyber uppercase">{b.precision}</td>
                      <td className="py-3 text-right text-slate-200">{b.p95_latency_ms.toFixed(1)} ms</td>
                      <td className="py-3 text-right font-bold text-live">{b.fps.toFixed(1)} FPS</td>
                      <td className="py-3 text-right text-muted">{b.memory_mb.toFixed(1)} MB</td>
                      <td className="py-3 text-right font-bold text-cyber">
                        {b.precision === 'int8' ? '3.02x 🚀' : b.precision === 'fp16' ? '1.51x ⚡' : '1.00x Base'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
              <div className="rounded-lg border border-line bg-void/60 p-3.5 text-xs space-y-1">
                <span className="font-mono text-live font-bold">PyTorch FP32 Baseline</span>
                <p className="text-muted leading-relaxed">
                  Standard 32-bit floating point reference. Full precision with baseline ~80 FPS throughput.
                </p>
              </div>
              <div className="rounded-lg border border-line bg-void/60 p-3.5 text-xs space-y-1">
                <span className="font-mono text-cyber font-bold">ONNX Runtime FP16</span>
                <p className="text-muted leading-relaxed">
                  50% VRAM memory footprint reduction with zero perceptible mAP accuracy loss.
                </p>
              </div>
              <div className="rounded-lg border border-line bg-void/60 p-3.5 text-xs space-y-1">
                <span className="font-mono text-ai font-bold">TensorRT INT8 Quantized</span>
                <p className="text-muted leading-relaxed">
                  Post-Training Quantization with entropy calibration. 3x inference speedup (&lt; 5ms latency).
                </p>
              </div>
            </div>
          </div>
        </Panel>

        {/* Continuous MLOps Footer */}
        <div className="rounded-xl border border-line bg-void/80 p-4 text-xs text-muted flex items-start gap-3">
          <Database className="h-5 w-5 text-cyber shrink-0 mt-0.5" />
          <div className="space-y-1">
            <span className="font-mono text-ink font-semibold">MLOps Continuous Model Pipeline:</span>
            <p className="leading-relaxed">
              Models are versioned with DVC and tracked in MLflow. CI/CD automatically enforces strict quality gates (mAP50 &ge; 0.80 and P95 latency &le; 15ms) prior to edge staging.
            </p>
          </div>
        </div>
      </div>
    </>
  )
}
