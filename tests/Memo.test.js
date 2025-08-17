import { mount } from '@vue/test-utils'
import { createPinia } from 'pinia'
import Memo from '../src/components/Memo.vue'
import { describe, it, expect, vi } from 'vitest'
import { useClient } from '../src/stores/client'

vi.mock('../src/stores/client', () => ({
  useClient: vi.fn(() => ({
    http: vi.fn(() => Promise.resolve({ data: [] })),
  })),
}))

import { useGlobalsStore } from '../src/stores/globals'
import PrimeVue from 'primevue/config';

describe('Memo.vue', () => {
  it('renders the component', () => {
    const pinia = createPinia()
    const store = useGlobalsStore(pinia)

    // Set up the mock config that the component expects
    store.config = {
      getMemosRoute: '/memo/all',
      getBootRoute: '/memo/boot',
      colors: {
        primary: '#007bff'
      }
    }

    const wrapper = mount(Memo, {
      global: {
        plugins: [pinia, PrimeVue],
        mocks: {
          $memoglobals: store.config
        }
      },
    })
    expect(wrapper.exists()).toBe(true)
  })
})
