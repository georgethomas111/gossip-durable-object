
const Nodes = function() {
  let nodeNames = []
  let nodeIdCounter = 0
  const nodeMap = new Map()

  return {
    add: function(name) {
      if (nodeNames.includes(name)) {
        throw new Error(`Node with name "${name}" already exists`)
      }

      nodeIdCounter++
      nodeMap.set(name, nodeIdCounter)
      nodeNames.push(name)

    },

    available: function() {
      return Array.from(nodeMap.keys())
    },

    deleteNode: function(name) {
      if (!nodeMap.has(name)) {
        throw new Error(`Node with name "${name}" does not exist`)
      }

      const nodeId = nodeMap.get(name)
      nodeMap.delete(name)
      nodeNames.splice(nodeNames.indexOf(name), 1)
    }
  }
}

// Example usage:
const nodes = new Nodes()
nodes.add('Node1')
nodes.add('Node2')

console.log("Saved nodes =", nodes.available()) // Output: ["Node1", "Node2"]
console.log("Deleting node1")
nodes.deleteNode('Node1') // Output: Deleted node Node1 with ID 1

console.log(nodes.available()) // Output: ["Node2"]
