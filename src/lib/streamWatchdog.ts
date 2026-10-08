export interface StreamHealthStatus {
  cameraId: string
  connected: boolean
  droppedFrames: number
  reconnectAttempts: number
  lastFrameTimestamp: number
}

export class StreamWatchdog {
  private cameraMap: Map<string, StreamHealthStatus> = new Map()

  registerCamera(cameraId: string): void {
    this.cameraMap.set(cameraId, {
      cameraId,
      connected: true,
      droppedFrames: 0,
      reconnectAttempts: 0,
      lastFrameTimestamp: Date.now(),
    })
  }

  recordFrame(cameraId: string): void {
    const status = this.cameraMap.get(cameraId)
    if (status) {
      status.lastFrameTimestamp = Date.now()
      status.connected = true
    }
  }

  recordDrop(cameraId: string): void {
    const status = this.cameraMap.get(cameraId)
    if (status) {
      status.droppedFrames += 1
    }
  }

  getHealth(cameraId: string): StreamHealthStatus | undefined {
    return this.cameraMap.get(cameraId)
  }
}

export const streamWatchdog = new StreamWatchdog()
