export type LivenessAttack = 'replay' | 'camera-injection' | 'face-swap'
export type LivenessDefense = 'static-photo' | 'flash-challenge' | 'depth-motion' | 'full-pad'

export interface LivenessAttackInfo {
  id: LivenessAttack
  label: string
  description: string
}

export interface LivenessDefenseInfo {
  id: LivenessDefense
  label: string
  description: string
}

export interface LivenessOutcome {
  attack: LivenessAttack
  defense: LivenessDefense
  stopped: boolean
  explanation: string
}

export const LIVENESS_ATTACKS: LivenessAttackInfo[] = [
  { id: 'replay', label: 'Presentation Replay', description: 'A previously recorded video of the legitimate user is played back at the camera.' },
  { id: 'camera-injection', label: 'Camera-Feed Injection', description: 'A synthetic video stream is piped directly into the verification SDK, bypassing the physical camera driver entirely.' },
  { id: 'face-swap', label: 'Real-Time Face-Swap', description: 'An attacker\'s live camera feed is run through a real-time deepfake model that swaps their face onto the legitimate user\'s.' },
]

export const LIVENESS_DEFENSES: LivenessDefenseInfo[] = [
  { id: 'static-photo', label: 'Single Static Photo Check', description: 'Compares one still frame against an enrolled photo — no motion or challenge involved.' },
  { id: 'flash-challenge', label: 'Challenge-Response Flash Sequence', description: 'Displays a randomized sequence of screen colors and checks that the reflected light on the subject\'s face matches in real time.' },
  { id: 'depth-motion', label: 'Passive Depth & Micro-Movement Analysis', description: 'Analyzes depth cues and involuntary micro-movements (blinking, subtle head jitter) without an active challenge.' },
  { id: 'full-pad', label: 'Full ISO 30107-3 PAD Scoring', description: 'Combines depth, texture/frequency analysis, device/SDK integrity attestation, and behavioral signals into a single composite Presentation Attack Detection score.' },
]

export const LIVENESS_ATTACK_MATRIX: LivenessOutcome[] = [
  { attack: 'replay', defense: 'static-photo', stopped: false, explanation: 'A static photo check has no motion or challenge component, so a recorded video frame looks identical to a live one.' },
  { attack: 'replay', defense: 'flash-challenge', stopped: true, explanation: 'The attacker\'s pre-recorded video can\'t react to a randomized light pattern in real time, since the footage was captured before the challenge was ever issued.' },
  { attack: 'replay', defense: 'depth-motion', stopped: true, explanation: 'Played-back video is flat and lacks the depth cues and involuntary micro-movements a live 3D face produces.' },
  { attack: 'replay', defense: 'full-pad', stopped: true, explanation: 'Full PAD scoring includes both the challenge-response and depth checks that already independently catch a replay.' },

  { attack: 'camera-injection', defense: 'static-photo', stopped: false, explanation: 'The injected stream can trivially present a single frame that passes a photo comparison — there is no liveness signal to defeat.' },
  { attack: 'camera-injection', defense: 'flash-challenge', stopped: false, explanation: 'Because the injected stream bypasses the camera driver, the attacker\'s software can read the challenge pattern the SDK just issued and script a matching reflected-light response.' },
  { attack: 'camera-injection', defense: 'depth-motion', stopped: false, explanation: 'A synthetic stream can fabricate plausible depth and micro-movement data just as easily as it fabricates the base video, since nothing constrains it to match a real camera sensor.' },
  { attack: 'camera-injection', defense: 'full-pad', stopped: true, explanation: 'Full PAD scoring includes device/SDK integrity attestation, which detects that the frames never actually originated from the expected camera hardware pipeline — the one signal camera injection cannot fake.' },

  { attack: 'face-swap', defense: 'static-photo', stopped: false, explanation: 'A single frame of a well-rendered real-time face-swap can look convincingly like the enrolled user.' },
  { attack: 'face-swap', defense: 'flash-challenge', stopped: false, explanation: 'The attacker is physically present and driving the live feed, so the real reflected light from the challenge sequence still hits their face and gets rendered through by the swap model in real time.' },
  { attack: 'face-swap', defense: 'depth-motion', stopped: false, explanation: 'The depth and micro-movements are genuinely real, since it\'s the attacker\'s own physical face and body behind the swap — only the texture is synthetic.' },
  { attack: 'face-swap', defense: 'full-pad', stopped: true, explanation: 'Full PAD scoring adds texture/frequency-domain analysis that detects the subtle rendering artifacts and temporal inconsistencies real-time face-swap models still introduce at the pixel level.' },
]

export function getLivenessOutcome(attack: LivenessAttack, defense: LivenessDefense): LivenessOutcome | undefined {
  return LIVENESS_ATTACK_MATRIX.find((o) => o.attack === attack && o.defense === defense)
}
