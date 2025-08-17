import { vi } from 'vitest'

export const useClient = vi.fn(() => ({
  http: vi.fn(() => Promise.resolve({ data: [] })),
}))
