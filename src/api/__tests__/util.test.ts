import * as utils from '../util'
import { reset } from '../db/db'
import mock from 'mock-fs'
import path from 'path'
import { v4 as uuidv4 } from 'uuid'

const testDbString = '../database.test.txt'

describe('Util tests', () => {
  function createMockUuid() {
    // Creates random unique ID for a mock object
    return uuidv4()
  }

  const workspaceId = createMockUuid()
  const tableId = createMockUuid()
  const shipmentId = createMockUuid()

  beforeEach(() => {
    mock({ [path.resolve(__dirname, testDbString)]: '' })
    reset(testDbString, workspaceId)
  })

  afterEach(() => {
    mock.restore()
  })

  describe('getWorkspaces', () => {
    it('returns the workspaces from the db', () => {
      const workspaces = utils.getWorkspaces(testDbString)
      expect(workspaces).toBeDefined()
      expect(workspaces).toHaveLength(1)
      expect(workspaces[0].id).toBe(workspaceId)
      expect(workspaces[0].title).toEqual("Wiley's Shipping")
      expect(workspaces[0].buildShipments).toHaveLength(1)
      expect(workspaces[0].buildShipments[0].buildNumber).toEqual('A82D2-108')
      expect(workspaces[0].buildShipments[0].shipments).toHaveLength(1)
      expect(workspaces[0].buildShipments[0].shipments[0].description).toEqual('64 units')
    })
  })

  describe('getWorkspace', () => {
    it('returns the queried workspace from the db', () => {
      const workspace = utils.getWorkspace(testDbString, workspaceId)
      expect(workspace).toBeDefined()
      expect(workspace.title).toEqual("Wiley's Shipping")
      expect(workspace.buildShipments).toHaveLength(1)
    })
  })

  describe('createWorkspace', () => {
    it('creates a new workspace', () => {
      const workspace = utils.createWorkspace(testDbString)
      expect(workspace).toBeDefined()
      expect(workspace.title).toEqual('')
      expect(workspace.buildShipments).toHaveLength(1)
      expect(workspace.buildShipments[0].shipments).toHaveLength(1)
      expect(workspace.buildShipments[0].buildNumber).toEqual('')
      expect(workspace.buildShipments[0].shipments[0].description).toEqual('')
    })
  })

  describe('updateWorkspace', () => {
    it('updates a workspace', () => {
      const workspace = utils.createWorkspace(testDbString)
      workspace.title = "Arnav's Shipping"
      utils.updateWorkspace(testDbString, workspace)
      const updatedWorkspace = utils.getWorkspace(testDbString, workspace.id)
      expect(updatedWorkspace.title).toEqual("Arnav's Shipping")
    })
  })

  describe('addTableToWorkspace', () => {
    it('adds a new table to workspace', () => {
      const workspace = utils.getWorkspace(testDbString, workspaceId)
      const initialTableCount = workspace.buildShipments.length
      const tableId = uuidv4()
      const buildNumber = 'B123'

      const updatedWorkspace = utils.addTableToWorkspace(testDbString, workspaceId, {
        id: tableId,
        buildNumber,
        shipments: []
      })

      expect(updatedWorkspace.buildShipments).toHaveLength(initialTableCount + 1)
      const newTable = updatedWorkspace.buildShipments[updatedWorkspace.buildShipments.length - 1]
      expect(newTable.buildNumber).toBe(buildNumber)
      expect(newTable.shipments).toHaveLength(0)
    })

    it('throws error if workspace does not exist', () => {
      const nonExistentId = uuidv4()
      expect(() =>
        utils.addTableToWorkspace(testDbString, nonExistentId, {
          id: uuidv4(),
          buildNumber: 'B123',
          shipments: []
        })
      ).toThrow()
    })
  })

  describe('addShipmentToTable', () => {
    it('adds a new shipment to table', () => {
      const workspace = utils.getWorkspace(testDbString, workspaceId)
      const tableId = workspace.buildShipments[0].id
      const initialShipmentCount = workspace.buildShipments[0].shipments.length

      const shipment = {
        id: uuidv4(),
        description: 'Test shipment',
        orderNumber: 'ORDER-123',
        cost: 10000
      }

      const updatedWorkspace = utils.addShipmentToTable(
        testDbString, 
        workspaceId, 
        tableId,
        shipment
      )

      const updatedTable = updatedWorkspace.buildShipments.find(t => t.id === tableId)
      expect(updatedTable?.shipments).toHaveLength(initialShipmentCount + 1)
      expect(updatedTable?.shipments[updatedTable.shipments.length - 1]).toMatchObject(shipment)
    })

    it('throws error if table does not exist', () => {
      const nonExistentTableId = uuidv4()
      expect(() =>
        utils.addShipmentToTable(testDbString, workspaceId, nonExistentTableId, {
          id: uuidv4(),
          description: 'Test',
          orderNumber: 'ORDER-1',
          cost: 1000
        })
      ).toThrow()
    })
  })

  describe('deleteTable', () => {
    it('deletes a table from workspace', () => {
      const workspace = utils.getWorkspace(testDbString, workspaceId)
      const tableToDelete = workspace.buildShipments[0]
      const initialTableCount = workspace.buildShipments.length

      const updatedWorkspace = utils.deleteTable(testDbString, workspaceId, tableToDelete.id)

      expect(updatedWorkspace.buildShipments).toHaveLength(initialTableCount - 1)
      expect(updatedWorkspace.buildShipments.find(t => t.id === tableToDelete.id)).toBeUndefined()
    })

    it('throws error if table does not exist', () => {
      const nonExistentTableId = uuidv4()
      expect(() =>
        utils.deleteTable(testDbString, workspaceId, nonExistentTableId)
      ).toThrow()
    })
  })

  describe('deleteShipment', () => {
    it('deletes a shipment from table', () => {
      const workspace = utils.getWorkspace(testDbString, workspaceId)
      const table = workspace.buildShipments[0]
      const shipmentToDelete = table.shipments[0]
      const initialShipmentCount = table.shipments.length

      const updatedWorkspace = utils.deleteShipment(
        testDbString,
        workspaceId,
        table.id,
        shipmentToDelete.id
      )

      const updatedTable = updatedWorkspace.buildShipments.find(t => t.id === table.id)
      expect(updatedTable?.shipments).toHaveLength(initialShipmentCount - 1)
      expect(updatedTable?.shipments.find(s => s.id === shipmentToDelete.id)).toBeUndefined()
    })

    it('throws error if shipment does not exist', () => {
      const workspace = utils.getWorkspace(testDbString, workspaceId)
      const tableId = workspace.buildShipments[0].id
      const nonExistentShipmentId = uuidv4()

      expect(() =>
        utils.deleteShipment(testDbString, workspaceId, tableId, nonExistentShipmentId)
      ).toThrow()
    })
  })
})
