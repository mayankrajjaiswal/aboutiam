import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { createWebllmConnector, detectWebGpuSupport, SPIKE_MODEL_ID } from './webllmConnector'

const { createWebWorkerMLCEngineMock } = vi.hoisted(() => ({
  createWebWorkerMLCEngineMock: vi.fn(),
}))

vi.mock('@mlc-ai/web-llm', () => ({
  CreateWebWorkerMLCEngine: createWebWorkerMLCEngineMock,
}))

class FakeWorker {
  terminate = vi.fn()
}

function makeFakeEngine(tokens: string[]) {
  return {
    unload: vi.fn().mockResolvedValue(undefined),
    chat: {
      completions: {
        create: vi.fn().mockResolvedValue(
          (async function* () {
            for (const token of tokens) {
              yield { choices: [{ delta: { content: token } }] }
            }
          })(),
        ),
      },
    },
  }
}

describe('detectWebGpuSupport', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('returns false when navigator has no gpu property', () => {
    vi.stubGlobal('navigator', {})
    expect(detectWebGpuSupport()).toBe(false)
  })

  it('returns true when navigator.gpu is present', () => {
    vi.stubGlobal('navigator', { gpu: {} })
    expect(detectWebGpuSupport()).toBe(true)
  })
})

describe('createWebllmConnector', () => {
  beforeEach(() => {
    vi.stubGlobal('navigator', { gpu: {} })
    vi.stubGlobal('Worker', FakeWorker)
    createWebWorkerMLCEngineMock.mockReset()
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('rejects load() when WebGPU is unsupported, without constructing a worker', async () => {
    vi.stubGlobal('navigator', {})
    const workerSpy = vi.fn()
    vi.stubGlobal('Worker', workerSpy)

    const connector = createWebllmConnector()
    await expect(connector.load(() => {})).rejects.toThrow(/WebGPU/)
    expect(workerSpy).not.toHaveBeenCalled()
  })

  it('forwards parsed progress percentages during load()', async () => {
    const engine = makeFakeEngine([])
    createWebWorkerMLCEngineMock.mockImplementation(async (_worker, _modelId, config) => {
      config.initProgressCallback({ text: 'Loading model [42%]' })
      return engine
    })

    const progressUpdates: Array<{ text: string; percent: number }> = []
    const connector = createWebllmConnector()
    await connector.load((progress) => progressUpdates.push(progress))

    expect(createWebWorkerMLCEngineMock).toHaveBeenCalledWith(
      expect.any(FakeWorker),
      SPIKE_MODEL_ID,
      expect.objectContaining({ initProgressCallback: expect.any(Function) }),
    )
    expect(progressUpdates).toEqual([{ text: 'Loading model [42%]', percent: 42 }])
  })

  it('propagates a load failure as a rejected promise, not an uncaught throw', async () => {
    createWebWorkerMLCEngineMock.mockRejectedValue(new Error('model fetch failed'))

    const connector = createWebllmConnector()
    await expect(connector.load(() => {})).rejects.toThrow('model fetch failed')
  })

  it('throws if generate() is called before load()', async () => {
    const connector = createWebllmConnector()
    await expect(connector.generate('hi', () => {})).rejects.toThrow(/not loaded/i)
  })

  it('streams tokens from the engine in order', async () => {
    const engine = makeFakeEngine(['Hel', 'lo', ' world'])
    createWebWorkerMLCEngineMock.mockResolvedValue(engine)

    const connector = createWebllmConnector()
    await connector.load(() => {})

    const received: string[] = []
    await connector.generate('hi', (token) => received.push(token))

    expect(received).toEqual(['Hel', 'lo', ' world'])
    expect(engine.chat.completions.create).toHaveBeenCalledWith({
      messages: [{ role: 'user', content: 'hi' }],
      stream: true,
    })
  })

  it('dispose() unloads the engine and terminates the worker', async () => {
    const engine = makeFakeEngine([])
    createWebWorkerMLCEngineMock.mockResolvedValue(engine)

    const connector = createWebllmConnector()
    await connector.load(() => {})
    connector.dispose()

    expect(engine.unload).toHaveBeenCalled()
  })
})
