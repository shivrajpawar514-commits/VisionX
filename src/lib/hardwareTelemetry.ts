export interface GpuSensorTelemetry {
  gpuName: string
  cudaUtilizationPct: number
  vramUsedMb: number
  vramTotalMb: number
  temperatureC: number
  fanSpeedPct: number
  powerDrawWatts: number
  clockSpeedMhz: number
  driverVersion: string
}

export function getGpuSensors(): GpuSensorTelemetry {
  return {
    gpuName: 'NVIDIA Orin AGX 64GB (JetPack 6.0)',
    cudaUtilizationPct: 42.5,
    vramUsedMb: 3480,
    vramTotalMb: 16384,
    temperatureC: 48.2,
    fanSpeedPct: 35,
    powerDrawWatts: 28.4,
    clockSpeedMhz: 1300,
    driverVersion: 'CUDA 12.2 / TensorRT 8.6.1',
  }
}
