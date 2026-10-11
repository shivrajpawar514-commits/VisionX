export interface ThreatAssessment {
  overallRiskScore: number
  riskLevel: 'LOW' | 'ELEVATED' | 'HIGH' | 'CRITICAL'
  activeIntrusions: number
  ppeViolations: number
  loiteringEvents: number
  recommendations: string[]
}

export function calculateThreatScore(
  intrusions = 1,
  ppe = 3,
  loitering = 2
): ThreatAssessment {
  const score = Math.min(100, intrusions * 40 + ppe * 10 + loitering * 15)

  let level: ThreatAssessment['riskLevel'] = 'LOW'
  if (score >= 75) level = 'CRITICAL'
  else if (score >= 50) level = 'HIGH'
  else if (score >= 25) level = 'ELEVATED'

  const recommendations = []
  if (intrusions > 0) recommendations.push('Dispatch security patrol to North Fence perimeter')
  if (ppe > 0) recommendations.push('Issue mandatory safety audio warning to Loading Bay workers')
  if (loitering > 0) recommendations.push('Review access control logs for unbadged personnel')

  return {
    overallRiskScore: score,
    riskLevel: level,
    activeIntrusions: intrusions,
    ppeViolations: ppe,
    loiteringEvents: loitering,
    recommendations,
  }
}
