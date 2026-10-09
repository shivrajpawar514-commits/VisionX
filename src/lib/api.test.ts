import { describe, it, expect, beforeEach } from 'vitest'
import { api, setUseMock } from './api'

describe('VisionX API Client Test Suite', () => {
  beforeEach(() => {
    setUseMock(true)
  })

  it('should fetch cameras list in mock mode', async () => {
    const cameras = await api.getCameras()
    expect(cameras).toBeDefined()
    expect(cameras.length).toBeGreaterThan(0)
    expect(cameras[0]).toHaveProperty('id')
    expect(cameras[0]).toHaveProperty('resolution')
  })

  it('should fetch analytics events list', async () => {
    const events = await api.getEvents(10)
    expect(events.length).toBeLessThanOrEqual(10)
    expect(events[0]).toHaveProperty('severity')
  })

  it('should process natural language query askVideo', async () => {
    const res = await api.askVideo('What PPE safety violations occurred today?')
    expect(res).toBeDefined()
    expect(res.confidence).toBeGreaterThan(0.5)
    expect(res.answer).toContain('Analysis')
  })

  it('should generate executive video activity briefing', async () => {
    const summary = await api.summarizeVideo(4)
    expect(summary.time_window_hours).toBe(4)
    expect(summary.highlights).toBeDefined()
  })
})
