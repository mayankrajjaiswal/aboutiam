import { WebWorkerMLCEngineHandler } from '@mlc-ai/web-llm'

const engineHandler = new WebWorkerMLCEngineHandler()

self.onmessage = (msg: MessageEvent) => {
  engineHandler.onmessage(msg)
}
