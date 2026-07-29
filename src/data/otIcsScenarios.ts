export type OtIcsNodeType = 'plc' | 'hmi' | 'sensor' | 'engineering-workstation' | 'boundary-gateway'

export interface OtIcsNode {
  id: string
  label: string
  type: OtIcsNodeType
  /** Most OT/ICS field devices structurally cannot perform identity authentication at all. */
  canAuthenticate: boolean
  zone: string
}

export interface OtIcsEdge {
  fromId: string
  toId: string
}

export interface OtIcsTopology {
  nodes: OtIcsNode[]
  edges: OtIcsEdge[]
}

export const OT_ICS_TOPOLOGY: OtIcsTopology = {
  nodes: [
    { id: 'hmi-1', label: 'HMI — Production Line 1', type: 'hmi', canAuthenticate: false, zone: 'production-line-1' },
    { id: 'plc-1', label: 'PLC — Production Line 1', type: 'plc', canAuthenticate: false, zone: 'production-line-1' },
    { id: 'sensor-1', label: 'RTU/Sensor — Production Line 1', type: 'sensor', canAuthenticate: false, zone: 'production-line-1' },
    { id: 'hmi-2', label: 'HMI — Production Line 2', type: 'hmi', canAuthenticate: false, zone: 'production-line-2' },
    { id: 'plc-2', label: 'PLC — Production Line 2', type: 'plc', canAuthenticate: false, zone: 'production-line-2' },
    { id: 'sensor-2', label: 'RTU/Sensor — Production Line 2', type: 'sensor', canAuthenticate: false, zone: 'production-line-2' },
    { id: 'boundary-gateway', label: 'IT/OT Boundary Gateway', type: 'boundary-gateway', canAuthenticate: true, zone: 'boundary' },
    { id: 'engineering-workstation', label: 'Engineering Workstation', type: 'engineering-workstation', canAuthenticate: true, zone: 'engineering' },
  ],
  edges: [
    { fromId: 'hmi-1', toId: 'plc-1' },
    { fromId: 'hmi-1', toId: 'sensor-1' },
    { fromId: 'plc-1', toId: 'sensor-1' },
    { fromId: 'hmi-2', toId: 'plc-2' },
    { fromId: 'hmi-2', toId: 'sensor-2' },
    { fromId: 'plc-2', toId: 'sensor-2' },
    { fromId: 'hmi-1', toId: 'boundary-gateway' },
    { fromId: 'hmi-2', toId: 'boundary-gateway' },
    { fromId: 'boundary-gateway', toId: 'engineering-workstation' },
    { fromId: 'engineering-workstation', toId: 'plc-2' },
  ],
}

// Real-world reference stat cited in the design doc: unsegmented OT ransomware
// dwell time runs ~42 days on average, dropping to ~5 days with full
// identity-based segmentation and visibility.
export const FLAT_NETWORK_DWELL_DAYS = 42
export const SEGMENTED_NETWORK_DWELL_DAYS = 5
