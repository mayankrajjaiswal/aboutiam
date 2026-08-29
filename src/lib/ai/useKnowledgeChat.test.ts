// @vitest-environment jsdom
import { describe, it, expect } from 'vitest'
import { useKnowledgeChat } from './useKnowledgeChat'
import { renderHook, act } from '@testing-library/react'

describe('useKnowledgeChat Local RAG Hook', () => {
  it('should initialize with welcome message and standard states', () => {
    const { result } = renderHook(() => useKnowledgeChat())
    expect(result.current.messages).toHaveLength(1)
    expect(result.current.messages[0].sender).toBe('assistant')
    expect(result.current.localAiStatus).toBe('off')
  })

  it('allows user to send message and processes simulated response', async () => {
    const { result } = renderHook(() => useKnowledgeChat())

    act(() => {
      result.current.handleSendMessage('explain zero trust')
    })

    expect(result.current.messages).toHaveLength(2)
    expect(result.current.messages[1].text).toBe('explain zero trust')
    expect(result.current.messages[1].sender).toBe('user')
  })
})
