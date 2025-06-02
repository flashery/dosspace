import axios from 'axios'
import { DetailWorkspace } from './components/WorkspaceDetails'
import { ShipmentTable } from '../api/types'

const BASE_URL = 'http://localhost:8080'

interface NewShipment {
  description: string
  orderNumber: string
  cost: number
}

/** The API for the app, for querying, creating and updating workspaces */
class DosspaceApi {
  /** Returns the ID and title of every existing workspace */
  static async getWorkspaces() {
    try {
      const req = await axios.get(BASE_URL)
      const { workspaces } = req.data
      return workspaces
    } catch (err) {
      throw new Error('Unable to fetch workspaces')
    }
  }

  /** Returns the details about the given workspace ID */
  static async getWorkspace(workspaceId: string): Promise<DetailWorkspace> {
    try {
      const req = await axios.get(`${BASE_URL}/${workspaceId}`)
      const { workspace } = req.data
      return workspace
    } catch (err) {
      throw new Error('Unable to fetch workspace')
    }
  }

  /** Adds a new table to a workspace */
  static async addTableToWorkspace(workspaceId: string, buildNumber: string): Promise<DetailWorkspace> {
    try {
      const newTable = {
        buildNumber,
        shipments: []
      }
      const req = await axios.post(`${BASE_URL}/${workspaceId}/tables`, { table: newTable })
      const { workspace } = req.data
      return workspace
    } catch (err) {
      throw new Error('Unable to add table to workspace')
    }
  }

  /** Adds a new shipment to a table */
  static async addShipmentToTable(
    workspaceId: string, 
    tableId: string, 
    shipment: NewShipment
  ): Promise<DetailWorkspace> {
    try {
      const req = await axios.post(
        `${BASE_URL}/${workspaceId}/tables/${tableId}/shipments`,
        { shipment }
      )
      const { workspace } = req.data
      return workspace
    } catch (err) {
      throw new Error('Unable to add shipment to table')
    }
  }

  /** Deletes a shipment from a table */
  static async deleteShipment(
    workspaceId: string,
    tableId: string,
    shipmentId: string
  ): Promise<DetailWorkspace> {
    try {
      const req = await axios.delete(
        `${BASE_URL}/${workspaceId}/tables/${tableId}/shipments/${shipmentId}`
      )
      const { workspace } = req.data
      return workspace
    } catch (err) {
      throw new Error('Unable to delete shipment')
    }
  }

  /** Deletes a table from a workspace */
  static async deleteTable(
    workspaceId: string,
    tableId: string
  ): Promise<DetailWorkspace> {
    try {
      const req = await axios.delete(
        `${BASE_URL}/${workspaceId}/tables/${tableId}`
      )
      const { workspace } = req.data
      return workspace
    } catch (err) {
      throw new Error('Unable to delete table')
    }
  }
}

export default DosspaceApi
