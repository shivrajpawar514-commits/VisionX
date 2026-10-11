import { api, setUseMock } from './api'

export async function runApiTestSuite(): Promise<{ passed: boolean; testCount: number }> {
  setUseMock(true)
  let count = 0

  // Test 1: getCameras
  const cameras = await api.getCameras()
  if (!cameras || cameras.length === 0) throw new Error('getCameras returned empty')
  count++

  // Test 2: getEvents
  const events = await api.getEvents(10)
  if (!events) throw new Error('getEvents failed')
  count++

  // Test 3: askVideo
  const res = await api.askVideo('What PPE safety violations occurred today?')
  if (!res || res.confidence < 0.5) throw new Error('askVideo confidence check failed')
  count++

  // Test 4: summarizeVideo
  const summary = await api.summarizeVideo(4)
  if (!summary || summary.time_window_hours !== 4) throw new Error('summarizeVideo failed')
  count++

  return { passed: true, testCount: count }
}
