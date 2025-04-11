// nodes.js (now ES6)
let nodeIdCounter = 0

export function Nodes() {
  const nodeMap = new Map()
  let ttl = 60 * 1000 // 1 minute in ms

  return {
    add(name) {
      nodeMap.set(name, { id: nodeIdCounter++, checkinTime: Date.now() })
    },

    available() {
      const currentTime = Date.now()
      for (let [name, node] of nodeMap) {
        if ((currentTime - node.checkinTime) > ttl) {
          this.deleteNode(name)
        }
      }
      return Array.from(nodeMap.keys())
    },

    checkin(name) {
      if (!nodeMap.has(name)) {
        this.add(name)
      }
      nodeMap.get(name).checkinTime = Date.now()
    },

    deleteNode(name) {
      nodeMap.delete(name)
    },

    // internal access for testing
    _getNodeMap: () => nodeMap,
    _setTTL: (newTTL) => { ttl = newTTL }
  }
}

