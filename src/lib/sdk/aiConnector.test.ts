import { describe, it, expect } from 'vitest'
import { serializePlaygroundStateForAI, PlaygroundAIState } from './aiConnector'

describe('Identity Playground SDK AI Connector', () => {
  it('should compile active playground state into structured AI-LD format', () => {
    const mockState: PlaygroundAIState = {
      moduleId: 'jwt_studio_lab',
      score: 85,
      currentStep: 2,
      isCompleted: false,
      logs: [
        { timestamp: '12:00:00 AM', type: 'info', message: 'Session initialized' },
        { timestamp: '12:01:15 AM', type: 'warning', message: 'Weak secret detected' }
      ],
      userVariables: {
        algorithm: 'none',
        payload_sub: 'admin_user'
      }
    }

    const resultString = serializePlaygroundStateForAI(mockState)
    const result = JSON.parse(resultString)

    expect(result.aboutiam_sdk_version).toBe('2.0.0')
    expect(result.context.module_id).toBe('jwt_studio_lab')
    expect(result.context.completion_status).toBe('IN_PROGRESS')
    expect(result.context.grc_security_score).toBe('85 / 100')
    expect(result.context.checkpoint_index).toBe(2)
    expect(result.context.active_variables.algorithm).toBe('none')
    expect(result.context.activity_logs).toContain('Session initialized')
  })
})
