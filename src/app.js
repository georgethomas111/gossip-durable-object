// server.mjs
import express from 'express'
import { Nodes } from './nodes.js'

const app = express()
const nodes = Nodes()

app.get('/', (req, res) => {
  res.send('Hello World!')
})

// Get list of available nodes
app.get('/nodes', (req, res) => {
  const availableNodes = nodes.available()
  res.json(availableNodes)
})


function handleCheckin(req, res) {
  const name = req.query.name || req.body.name
  if (!name) {
    return res.status(400).json({ error: 'Missing "name" parameter' })
  }

  nodes.checkin(name)
  res.json({ message: `Node "${name}" checked in.` })
}


// Accept checkins via both GET and POST
app.get('/nodes/checkin', handleCheckin)
app.post('/nodes/checkin', handleCheckin)

const PORT = 3005
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`)
})

