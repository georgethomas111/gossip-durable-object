// nodes.test.js
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { Nodes } from './nodes.js'

describe('Nodes module', () => {
  let nodes

  beforeEach(() => {
    nodes = Nodes()
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2025-01-01T00:00:00Z'))
  })


  it('adds and retrieves a node with correct timestamp', () => {
    nodes.checkin('alpha')
    const available = nodes.available()
    expect(available.length).toBe(1)
    expect(available[0][0]).toBe('alpha')
    expect(available[0][1]).toBe(new Date('2025-01-01T00:00:00Z').toUTCString())
  })

  it('removes nodes that exceed TTL', () => {
    nodes.checkin('alpha')

    // Advance time beyond TTL
    vi.advanceTimersByTime(61 * 1000)

    const available = nodes.available()
    expect(available).toEqual([])
  })

  it('refreshes checkin time if node already exists', () => {
    nodes.checkin('alpha')
    vi.advanceTimersByTime(30 * 1000)
    nodes.checkin('alpha') // Refresh checkin

    vi.advanceTimersByTime(31 * 1000) // Total 61s since original, but only 31s since refresh
    const available = nodes.available()
    expect(available.length).toBe(1)
    expect(available[0][0]).toBe('alpha')
  })

  it('returns multiple nodes with correct timestamps', () => {
    nodes.checkin('node1')
    vi.advanceTimersByTime(1000)
    nodes.checkin('node2')

    const result = nodes.available()
    expect(result.length).toBe(2)
    expect(result[0][0]).toBe('node1')
    expect(result[1][0]).toBe('node2')
  })
})

