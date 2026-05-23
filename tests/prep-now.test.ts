import { readFileSync, writeFileSync, copyFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { consola } from 'consola'

import newNow from '../commands/prep-now'

// Mock file system operations
vi.mock('path', () => ({
  resolve: vi.fn(),
  readFileSync: vi.fn(),
  writeFileSync: vi.fn(),
  copyFileSync: vi.fn(),
}))

// Mock consola
vi.mock('consola', () => ({
  consola: {
    box: vi.fn(),
    start: vi.fn(),
    success: vi.fn(),
    fail: vi.fn(),
    error: vi.fn(),
  },
}))

// Mock mdToHTML
vi.mock('../command/md-to-html', () => ({
  mdToHTML: vi.fn(),
}))

describe('prep-now', () => {
  //   const mockNow = {
  //     title: 'Test Title',
  //     description: 'Test Description',
  //     publishedOn: '2023-01-01',
  //     publishDate: '2023-01-01',
  //     publishState: 'draft',
  //     content: '# Test Content',
  //   }

  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(resolve).mockImplementation((...paths) => paths.join('/'))
    vi.mocked(readFileSync).mockReturnValue('template content')
    vi.mocked(writeFileSync).mockImplementation(() => {})
    vi.mocked(copyFileSync).mockImplementation(() => {})
    vi.mocked(consola.box).mockImplementation(() => {})
    vi.mocked(consola.start).mockImplementation(() => {})
    vi.mocked(consola.success).mockImplementation(() => {})
    vi.mocked(consola.fail).mockImplementation(() => {})
    vi.mocked(consola.error).mockImplementation(() => {})
  })

  it('should create a new now page and clear the original files', async () => {
    // Mock the mdToHTML function
    const { mdToHTML } = await import('../utils/md-to-html')
    vi.mocked(mdToHTML).mockResolvedValue('<h1>Test Content</h1>')

    // Mock file paths
    vi.mocked(resolve)
      .mockReturnValueOnce('/src/constants/now.md')
      .mockReturnValueOnce('/src/constants/now.json')
      .mockReturnValueOnce('/src/pages/now/and-then/posts/2023-01-01.astro')
      .mockReturnValueOnce('/src/constants/bkup/2023-01-01.md')
      .mockReturnValueOnce('/src/constants/bkup/2023-01-01.json')

    // Mock file content
    vi.mocked(readFileSync)
      .mockReturnValueOnce('template content')
      .mockReturnValueOnce('# Test Content')

    // Mock file paths
    const __filename = '/src/commands/prep-now.ts'
    const __dirname = '/src/commands'
    vi.mocked(fileURLToPath).mockReturnValue(__filename)
    vi.mocked(dirname).mockReturnValue(__dirname)

    // Execute the function
    await newNow()

    // Verify file operations
    expect(writeFileSync).toHaveBeenCalledTimes(2)
    expect(copyFileSync).toHaveBeenCalledTimes(2)
    expect(consola.success).toHaveBeenCalledWith('now.md cleared')
    expect(consola.success).toHaveBeenCalledWith(
      'You may now update your Now content and props.\n'
    )
  })

  it('should handle errors gracefully', async () => {
    // Mock an error
    vi.mocked(writeFileSync).mockImplementation(() => {
      throw new Error('Write failed')
    })

    // Mock file paths
    vi.mocked(resolve)
      .mockReturnValueOnce('/src/constants/now.md')
      .mockReturnValueOnce('/src/constants/now.json')
      .mockReturnValueOnce('/src/pages/now/and-then/posts/2023-01-01.astro')
      .mockReturnValueOnce('/src/constants/bkup/2023-01-01.md')
      .mockReturnValueOnce('/src/constants/bkup/2023-01-01.json')

    // Mock file content
    vi.mocked(readFileSync)
      .mockReturnValueOnce('template content')
      .mockReturnValueOnce('# Test Content')

    // Execute the function
    await newNow()

    // Verify error handling
    expect(consola.fail).toHaveBeenCalledWith(
      'Failed to create a new post from Now'
    )
    expect(consola.error).toHaveBeenCalled()
  })
})
