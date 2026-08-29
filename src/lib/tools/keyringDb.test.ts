// @vitest-environment jsdom
/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { saveKeyRecord, getAllKeyRecords, deleteKeyRecord } from './keyringDb'

describe('HSM Vault IndexedDB KeyRing Database Wrapper', () => {
  let mockDB: any
  let mockStore: any
  let mockTransaction: any

  beforeEach(() => {
    vi.restoreAllMocks()

    // Reset IndexedDB mocks
    mockStore = {
      put: vi.fn().mockReturnValue({}),
      getAll: vi.fn().mockReturnValue({}),
      delete: vi.fn().mockReturnValue({})
    }

    mockTransaction = {
      objectStore: vi.fn().mockReturnValue(mockStore)
    }

    mockDB = {
      transaction: vi.fn().mockReturnValue(mockTransaction),
      objectStoreNames: {
        contains: vi.fn().mockReturnValue(true)
      }
    }

    // Set up global indexedDB mock
    const openRequest: any = {
      result: mockDB,
      onsuccess: null,
      onerror: null,
      onupgradeneeded: null
    }

    const mockIndexedDB = {
      open: vi.fn().mockReturnValue(openRequest)
    }

    Object.defineProperty(globalThis, 'indexedDB', {
      value: mockIndexedDB,
      writable: true,
      configurable: true
    })

    // Simulate openDatabase success after a tick
    mockIndexedDB.open.mockImplementation(() => {
      setTimeout(() => {
        if (openRequest.onsuccess) {
          openRequest.onsuccess()
        }
      }, 0)
      return openRequest
    })
  })

  it('saves a cryptographic key record successfully', async () => {
    const record = {
      id: 'key-1',
      name: 'Corporate SSH Key',
      type: 'ECDSA-P256' as const,
      createdAt: '2026-08-29'
    }

    const putRequest: any = {}
    mockStore.put.mockReturnValue(putRequest)

    // Simulate database transaction success
    mockTransaction.objectStore.mockImplementation(() => {
      setTimeout(() => {
        if (putRequest.onsuccess) {
          putRequest.onsuccess()
        }
      }, 5)
      return mockStore
    })

    await saveKeyRecord(record)
    expect(mockStore.put).toHaveBeenCalledWith(record)
  })

  it('fetches all cryptographic key records successfully', async () => {
    const mockRecords = [
      { id: 'key-1', name: 'Mock Key', type: 'ECDSA-P256' as const, createdAt: '2026' }
    ]

    const getAllRequest: any = {}
    mockStore.getAll.mockReturnValue(getAllRequest)

    mockTransaction.objectStore.mockImplementation(() => {
      setTimeout(() => {
        if (getAllRequest.onsuccess) {
          getAllRequest.result = mockRecords
          getAllRequest.onsuccess()
        }
      }, 5)
      return mockStore
    })

    const records = await getAllKeyRecords()
    expect(records).toEqual(mockRecords)
  })

  it('deletes a cryptographic key record successfully', async () => {
    const deleteRequest: any = {}
    mockStore.delete.mockReturnValue(deleteRequest)

    mockTransaction.objectStore.mockImplementation(() => {
      setTimeout(() => {
        if (deleteRequest.onsuccess) {
          deleteRequest.onsuccess()
        }
      }, 5)
      return mockStore
    })

    await deleteKeyRecord('key-1')
    expect(mockStore.delete).toHaveBeenCalledWith('key-1')
  })
})
