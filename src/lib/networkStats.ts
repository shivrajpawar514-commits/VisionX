export interface CameraNetworkStats {
  cameraId: string
  cameraName: string
  bitrateMbps: number
  packetLossPct: number
  jitterMs: number
  fps: number
  resolution: string
}

export function generateNetworkStats(): CameraNetworkStats[] {
  return [
    { cameraId: 'cam-01', cameraName: 'CAM-01 Main Entrance', bitrateMbps: 4.8, packetLossPct: 0.02, jitterMs: 1.2, fps: 60, resolution: '1920x1080' },
    { cameraId: 'cam-02', cameraName: 'CAM-02 Loading Bay', bitrateMbps: 5.2, packetLossPct: 0.05, jitterMs: 2.1, fps: 60, resolution: '1920x1080' },
    { cameraId: 'cam-03', cameraName: 'CAM-03 North Fence', bitrateMbps: 3.9, packetLossPct: 0.01, jitterMs: 0.8, fps: 30, resolution: '1920x1080' },
    { cameraId: 'cam-04', cameraName: 'CAM-04 Server Room', bitrateMbps: 2.4, packetLossPct: 0.00, jitterMs: 0.5, fps: 30, resolution: '1280x720' },
  ]
}
