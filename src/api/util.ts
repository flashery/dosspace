import { all, findOne, insert, update } from './db/db'
import { Workspace, ShipmentTable, Shipment } from './types'
import { v4 as uuidv4 } from 'uuid'

/** Returns a list of all workspaces in the database */
export function getWorkspaces(dbString: string): Workspace[] {
  return all(dbString, 'workspaces')
}

/** Returns a single workspace from the database */
export function getWorkspace(dbString: string, id: string): Workspace {
  return findOne(dbString, 'workspaces', id)
}

/** Create a workspace in the database */
export function createWorkspace(dbString: string): Workspace {
  const workspace: Workspace = {
    id: uuidv4(),
    title: '',
    buildShipments: [
      {
        id: uuidv4(),
        buildNumber: '',
        // Initialize the workspace with a single empty build shipment
        shipments: [{ id: uuidv4(), description: '', orderNumber: '', cost: 0 }],
      },
    ],
  }
  insert(dbString, 'workspaces', workspace)
  return workspace
}

/** Update a workspace in the database */
export function updateWorkspace(dbString: string, workspace: Workspace): Workspace {
  update(dbString, 'workspaces', workspace.id, workspace)
  return findOne(dbString, 'workspaces', workspace.id)
}

/** Add a table to a workspace */
export function addTableToWorkspace(dbString: string, workspaceId: string, table: ShipmentTable): Workspace {
  const workspace = findOne(dbString, 'workspaces', workspaceId)
  workspace.buildShipments.push(table)
  update(dbString, 'workspaces', workspaceId, workspace)
  return workspace
}

/** Add a shipment to a table */
export function addShipmentToTable(
  dbString: string,
  workspaceId: string,
  tableId: string,
  shipment: Shipment
): Workspace {
  const workspace = findOne(dbString, 'workspaces', workspaceId)
  const table = workspace.buildShipments.find(t => t.id === tableId)
  if (!table) {
    throw new Error(`Table ${tableId} not found in workspace ${workspaceId}`)
  }
  table.shipments.push(shipment)
  update(dbString, 'workspaces', workspaceId, workspace)
  return workspace
}

/** Delete a table from a workspace */
export function deleteTable(dbString: string, workspaceId: string, tableId: string): Workspace {
  const workspace = findOne(dbString, 'workspaces', workspaceId)
  const tableIndex = workspace.buildShipments.findIndex(t => t.id === tableId)
  if (tableIndex === -1) {
    throw new Error(`Table ${tableId} not found in workspace ${workspaceId}`)
  }
  workspace.buildShipments.splice(tableIndex, 1)
  update(dbString, 'workspaces', workspaceId, workspace)
  return workspace
}

/** Delete a shipment from a table */
export function deleteShipment(
  dbString: string,
  workspaceId: string,
  tableId: string,
  shipmentId: string
): Workspace {
  const workspace = findOne(dbString, 'workspaces', workspaceId)
  const table = workspace.buildShipments.find(t => t.id === tableId)
  if (!table) {
    throw new Error(`Table ${tableId} not found in workspace ${workspaceId}`)
  }
  const shipmentIndex = table.shipments.findIndex(s => s.id === shipmentId)
  if (shipmentIndex === -1) {
    throw new Error(`Shipment ${shipmentId} not found in table ${tableId}`)
  }
  table.shipments.splice(shipmentIndex, 1)
  update(dbString, 'workspaces', workspaceId, workspace)
  return workspace
}
