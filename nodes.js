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
      let a = []
      for (let [name, node] of nodeMap) {
        if ((currentTime - node.checkinTime) > ttl) {
          this.deleteNode(name)
	  continue
        }

        let d = new Date(node.checkinTime)
	a.push([name, d.toUTCString()])
      }
      return a
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
  }
}

