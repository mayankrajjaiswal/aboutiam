import { TraceLog } from './usePlayground'

export interface PlaygroundAIState {
  moduleId: string;
  score: number;
  currentStep: number;
  isCompleted: boolean;
  logs: TraceLog[];
  userVariables: Record<string, unknown>;
}

/**
 * Serializes the complete active playground state into a structured schema
 * suitable for feeding directly to client-side or server-side AI prompt templates.
 */
export function serializePlaygroundStateForAI(state: PlaygroundAIState): string {
  const formattedLogs = state.logs
    .map(l => `[${l.timestamp}] [${l.type.toUpperCase()}] ${l.message}`)
    .join('\n');

  return JSON.stringify({
    aboutiam_sdk_version: '2.0.0',
    intent: 'Analyze active playground progress and offer architectural advice',
    context: {
      module_id: state.moduleId,
      completion_status: state.isCompleted ? 'SOLVED' : 'IN_PROGRESS',
      grc_security_score: `${state.score} / 100`,
      checkpoint_index: state.currentStep,
      active_variables: state.userVariables,
      activity_logs: formattedLogs
    },
    prompt_guidelines: [
      "Check if user variables contain security vulnerabilities (e.g. weak keys, algorithmic fallback, wildcard routing).",
      "Suggest concrete, vendor-neutral defensive remediation codes.",
      "Address steps to unlock the next checkpoint without giving away the direct flag values."
    ]
  }, null, 2);
}
