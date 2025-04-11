// nodes.test.js
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { Nodes } from './nodes.js'

vi.useFakeTimers()

describe('Nodes', () => {
  let nodes

  beforeEach(() => {
    nodes = Nodes()
  })

  it('adds a node', () => {
    nodes.add('nodeA')
    expect(nodes.available()).toContain('nodeA')
  })

  it('checkin adds new node if not present', () => {
    nodes.checkin('nodeB')
    expect(nodes.available()).toContain('nodeB')
  })

  it('checkin updates existing node timestamp', () => {
    nodes.add('nodeC')
    const original = nodes._getNodeMap().get('nodeC').checkinTime

    vi.advanceTimersByTime(1000)
    nodes.checkin('nodeC')
    const updated = nodes._getNodeMap().get('nodeC').checkinTime

    expect(updated).toBeGreaterThan(original)
  })

  it('removes node after TTL expires', () => {
    nodes._setTTL(5000)
    nodes.add('nodeD')

    vi.advanceTimersByTime(6000)
    expect(nodes.available()).not.toContain('nodeD')
  })

  it('deleteNode manually removes node', () => {
    nodes.add('nodeE')
    nodes.deleteNode('nodeE')
    expect(nodes.available()).not.toContain('nodeE')
  })
})

