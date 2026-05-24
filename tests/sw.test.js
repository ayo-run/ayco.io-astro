import { describe, it, expect, vi, beforeEach } from 'vitest'
import { install } from 'vitest-dom'

// Install DOM environment for vitest
install()

// Mock the service worker globals
global.caches = {
  keys: vi.fn(),
  delete: vi.fn(),
  open: vi.fn(),
  match: vi.fn(),
}

// Mock the global self object
global.self = {
  skipWaiting: vi.fn(),
  addEventListener: vi.fn(),
}

// Mock the fetch function
global.fetch = vi.fn()

// Import the service worker module
// Note: We need to use dynamic import to avoid module loading issues
let swModule

beforeEach(async () => {
  // Clear all mocks
  vi.clearAllMocks()

  // Mock the module
  swModule = await import('../src/sw.mjs')
})

describe('Service Worker', () => {
  describe('cleanOldCaches', () => {
    it('should delete old caches', async () => {
      const cacheName = 'app-v000'
      const oldCacheName = 'app-v001'

      global.caches.keys.mockResolvedValue([cacheName, oldCacheName])
      global.caches.delete.mockResolvedValue(true)

      await swModule.cleanOldCaches()

      expect(global.caches.delete).toHaveBeenCalledWith(oldCacheName)
    })
  })

  describe('addResourcesToCache', () => {
    it('should add resources to cache', async () => {
      const resources = ['/index.html', '/style.css']
      const cache = { addAll: vi.fn() }

      global.caches.open.mockResolvedValue(cache)

      await swModule.addResourcesToCache(resources)

      expect(cache.addAll).toHaveBeenCalledWith(resources)
    })
  })

  describe('networkFirst', () => {
    it('should return network response when available', async () => {
      const request = new Request('/test')
      const networkResponse = new Response('network content')

      global.fetch.mockResolvedValue(networkResponse)
      global.caches.open.mockResolvedValue({ put: vi.fn() })

      const result = await swModule.networkFirst({ request })

      expect(result).toEqual(networkResponse)
    })

    it('should return cached response when network fails', async () => {
      const request = new Request('/test')
      const cachedResponse = new Response('cached content')

      global.fetch.mockRejectedValue(new Error('Network error'))
      global.caches.open.mockResolvedValue({
        match: vi.fn().mockResolvedValue(cachedResponse),
      })

      const result = await swModule.networkFirst({ request })

      expect(result).toEqual(cachedResponse)
    })
  })
})
