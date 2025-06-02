import express from 'express'
import cors from 'cors'
import { createWorkspace, getWorkspace, getWorkspaces, updateWorkspace } from './util'
import { reset } from './db/db'
import { v4 as uuidv4 } from 'uuid'

const app = express()
app.use(cors())
app.use(express.json())

const port = 8080
const dbString = '../database.txt'

/** Admin endpoint for resetting the database */
app.get('/reset', (req, res) => {
  reset(dbString)
  res.send('Reset database')
})

/** Returns the workspace with the given ID */
app.get('/:workspaceId', (req, res) => {
  res.json({ workspace: getWorkspace(dbString, req.params.workspaceId) })
})

/** Updates the workspace with the given ID and returns the updated workspace */
app.post('/:workspaceId', (req, res) => {
  const workspace = req.body.workspace
  res.json({ workspace: updateWorkspace(dbString, workspace) })
})

/** Adds a new table to a workspace */
app.post('/:workspaceId/tables', (req, res) => {
  const workspace = getWorkspace(dbString, req.params.workspaceId)
  const newTable = {
    id: uuidv4(),
    ...req.body.table
  }
  workspace.buildShipments.push(newTable)
  const updatedWorkspace = updateWorkspace(dbString, workspace)
  res.json({ workspace: updatedWorkspace })
})

/** Returns all workspaces in the database */
app.get('/', (req, res) => {
  const allWorkspaces = getWorkspaces(dbString)
  const workspaces = allWorkspaces.map((workspace) => ({
    id: workspace.id,
    title: workspace.title,
  }))
  res.json({ workspaces })
})

/** Creates a new workspace in the database and returns it */
app.post('/', (req, res) => {
  res.json({ workspace: createWorkspace(dbString) })
})

/** Adds a new shipment to a table in a workspace */
app.post('/:workspaceId/tables/:tableId/shipments', (req, res) => {
  const workspace = getWorkspace(dbString, req.params.workspaceId)
  const table = workspace.buildShipments.find(t => t.id === req.params.tableId)
  
  if (!table) {
    res.status(404).json({ error: 'Table not found' })
    return
  }

  const shipment = {
    id: uuidv4(),
    ...req.body.shipment
  }
  
  table.shipments.push(shipment)
  const updatedWorkspace = updateWorkspace(dbString, workspace)
  res.json({ workspace: updatedWorkspace })
})

/** Deletes a shipment from a table */
app.delete('/:workspaceId/tables/:tableId/shipments/:shipmentId', (req, res) => {
  const workspace = getWorkspace(dbString, req.params.workspaceId)
  const table = workspace.buildShipments.find(t => t.id === req.params.tableId)
  
  if (!table) {
    res.status(404).json({ error: 'Table not found' })
    return
  }

  const shipmentIndex = table.shipments.findIndex(s => s.id === req.params.shipmentId)
  if (shipmentIndex === -1) {
    res.status(404).json({ error: 'Shipment not found' })
    return
  }

  table.shipments.splice(shipmentIndex, 1)
  const updatedWorkspace = updateWorkspace(dbString, workspace)
  res.json({ workspace: updatedWorkspace })
})

/** Deletes a table from a workspace */
app.delete('/:workspaceId/tables/:tableId', (req, res) => {
  const workspace = getWorkspace(dbString, req.params.workspaceId)
  const tableIndex = workspace.buildShipments.findIndex(t => t.id === req.params.tableId)
  
  if (tableIndex === -1) {
    res.status(404).json({ error: 'Table not found' })
    return
  }

  workspace.buildShipments.splice(tableIndex, 1)
  const updatedWorkspace = updateWorkspace(dbString, workspace)
  res.json({ workspace: updatedWorkspace })
})

module.exports = app

app.listen(port, () => {
  console.log(`Dosspace is running on port ${port}.`)
})
