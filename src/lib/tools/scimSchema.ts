// Hand-rolled validator against the RFC 7643 core User/Group schema subset —
// no ajv dependency needed, the schema subset is small and static.
export interface ScimValidationError {
  path: string
  message: string
}

export const USER_SCHEMA_URN = 'urn:ietf:params:scim:schemas:core:2.0:User'
export const GROUP_SCHEMA_URN = 'urn:ietf:params:scim:schemas:core:2.0:Group'

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

export function validateScimUser(payload: unknown): ScimValidationError[] {
  if (!isPlainObject(payload)) return [{ path: '$', message: 'Payload must be a JSON object.' }]
  const errors: ScimValidationError[] = []

  if (!Array.isArray(payload.schemas) || !payload.schemas.includes(USER_SCHEMA_URN)) {
    errors.push({ path: 'schemas', message: `Must be an array including "${USER_SCHEMA_URN}".` })
  }

  if (typeof payload.userName !== 'string' || payload.userName.trim() === '') {
    errors.push({ path: 'userName', message: 'userName is required and must be a non-empty string (RFC 7643 §4.1).' })
  }

  if (payload.name !== undefined && !isPlainObject(payload.name)) {
    errors.push({ path: 'name', message: 'name must be a complex object, e.g. { "givenName": "...", "familyName": "..." }.' })
  }

  if (payload.emails !== undefined) {
    if (!Array.isArray(payload.emails)) {
      errors.push({ path: 'emails', message: 'emails must be an array of { "value": "...", "type": "..." } objects.' })
    } else {
      payload.emails.forEach((email, i) => {
        if (!isPlainObject(email) || typeof email.value !== 'string') {
          errors.push({ path: `emails[${i}]`, message: 'Each email entry must be an object with a string "value".' })
        }
      })
    }
  }

  if (payload.active !== undefined && typeof payload.active !== 'boolean') {
    errors.push({ path: 'active', message: 'active must be a boolean.' })
  }

  return errors
}

export function validateScimGroup(payload: unknown): ScimValidationError[] {
  if (!isPlainObject(payload)) return [{ path: '$', message: 'Payload must be a JSON object.' }]
  const errors: ScimValidationError[] = []

  if (!Array.isArray(payload.schemas) || !payload.schemas.includes(GROUP_SCHEMA_URN)) {
    errors.push({ path: 'schemas', message: `Must be an array including "${GROUP_SCHEMA_URN}".` })
  }

  if (typeof payload.displayName !== 'string' || payload.displayName.trim() === '') {
    errors.push({ path: 'displayName', message: 'displayName is required and must be a non-empty string (RFC 7643 §4.2).' })
  }

  if (payload.members !== undefined) {
    if (!Array.isArray(payload.members)) {
      errors.push({ path: 'members', message: 'members must be an array of { "value": "..." } objects.' })
    } else {
      payload.members.forEach((member, i) => {
        if (!isPlainObject(member) || typeof member.value !== 'string') {
          errors.push({ path: `members[${i}]`, message: 'Each member entry must be an object with a string "value".' })
        }
      })
    }
  }

  return errors
}

export function buildSampleScimUser() {
  return {
    schemas: [USER_SCHEMA_URN],
    userName: 'jdoe@example.com',
    name: { givenName: 'Jane', familyName: 'Doe' },
    emails: [{ value: 'jdoe@example.com', type: 'work', primary: true }],
    active: true,
  }
}

export function buildSampleScimGroup() {
  return {
    schemas: [GROUP_SCHEMA_URN],
    displayName: 'Engineering',
    members: [{ value: '2819c223-7f76-453a-919d-413861904646', display: 'Jane Doe' }],
  }
}
