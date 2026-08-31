import { CreateWebWorkerMLCEngine, type MLCEngineInterface } from '@mlc-ai/web-llm'

export const SPIKE_MODEL_ID = 'SmolLM2-360M-Instruct-q4f16_1-MLC'

export interface WebllmProgress {
  text: string
  percent: number
}

export interface WebllmConnector {
  load: (onProgress: (progress: WebllmProgress) => void) => Promise<void>
  generate: (prompt: string, onToken: (text: string) => void) => Promise<void>
  dispose: () => void
}

export function detectWebGpuSupport(): boolean {
  return typeof navigator !== 'undefined' && 'gpu' in navigator
}

function parseProgressPercent(text: string): number {
  const match = text.match(/(\d+)%/)
  return match ? Number(match[1]) : 0
}

export function createWebllmConnector(modelId: string = SPIKE_MODEL_ID): WebllmConnector {
  let engine: MLCEngineInterface | null = null
  let worker: Worker | null = null

  const load: WebllmConnector['load'] = async (onProgress) => {
    if (!detectWebGpuSupport()) {
      throw new Error('Hardware Acceleration (WebGPU) is required but not supported by your browser or OS. To protect your device from freezing, the WASM-only CPU fallback has been disabled. Try Chrome/Edge on a device with a dedicated or modern integrated GPU.')
    }

    worker = new Worker(new URL('./webllm.worker.ts', import.meta.url), { type: 'module' })

    engine = await CreateWebWorkerMLCEngine(worker, modelId, {
      initProgressCallback: (report) => {
        onProgress({ text: report.text, percent: parseProgressPercent(report.text) })
      }
    })
  }

  const generate: WebllmConnector['generate'] = async (prompt, onToken) => {
    if (!engine) {
      throw new Error('Model is not loaded yet. Call load() before generate().')
    }

    const chunks = await engine.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      stream: true,
    })

    for await (const chunk of chunks) {
      const delta = chunk.choices[0]?.delta?.content
      if (delta) {
        onToken(delta)
      }
    }
  }

  const dispose: WebllmConnector['dispose'] = () => {
    engine?.unload().catch(() => undefined)
    worker?.terminate()
    engine = null
    worker = null
  }

  return { load, generate, dispose }
}
