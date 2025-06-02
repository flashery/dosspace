import axios from 'axios'
import DosspaceApi from '../api'

// Mock axios
jest.mock('axios')
const mockedAxios = axios as jest.Mocked<typeof axios>

describe('DosspaceApi', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('getWorkspaces', () => {
    it('should fetch all workspaces', async () => {
      const mockWorkspaces = [
        { id: '1', title: 'Workspace 1' },
        { id: '2', title: 'Workspace 2' }
      ]

      mockedAxios.get.mockResolvedValueOnce({ data: { workspaces: mockWorkspaces } })

      const result = await DosspaceApi.getWorkspaces()

      expect(mockedAxios.get).toHaveBeenCalledWith('http://localhost:8080')
      expect(result).toEqual(mockWorkspaces)
    })

    it('should handle errors', async () => {
      mockedAxios.get.mockRejectedValueOnce(new Error('Network error'))

      await expect(DosspaceApi.getWorkspaces()).rejects.toThrow('Unable to fetch workspaces')
    })
  })

  describe('addTableToWorkspace', () => {
    it('should add a table to a workspace', async () => {
      const mockWorkspace = {
        id: '1',
        title: 'Test Workspace',
        buildShipments: []
      }

      mockedAxios.post.mockResolvedValueOnce({ data: { workspace: mockWorkspace } })

      const result = await DosspaceApi.addTableToWorkspace('1', 'BUILD-123')

      expect(mockedAxios.post).toHaveBeenCalledWith(
        'http://localhost:8080/1/tables',
        expect.objectContaining({
          table: expect.objectContaining({
            buildNumber: 'BUILD-123',
            shipments: []
          })
        })
      )
      expect(result).toEqual(mockWorkspace)
    })

    it('should handle errors when adding table', async () => {
      mockedAxios.post.mockRejectedValueOnce(new Error('Network error'))

      await expect(DosspaceApi.addTableToWorkspace('1', 'BUILD-123')).rejects.toThrow(
        'Unable to add table to workspace'
      )
    })
  })

  describe('addShipmentToTable', () => {
    it('should add a shipment to a table', async () => {
      const mockWorkspace = {
        id: '1',
        title: 'Test Workspace',
        buildShipments: []
      }

      const shipment = {
        description: 'Test shipment',
        orderNumber: 'ORDER-123',
        cost: 10000
      }

      mockedAxios.post.mockResolvedValueOnce({ data: { workspace: mockWorkspace } })

      const result = await DosspaceApi.addShipmentToTable('1', 'table-1', shipment)

      expect(mockedAxios.post).toHaveBeenCalledWith(
        'http://localhost:8080/1/tables/table-1/shipments',
        { shipment }
      )
      expect(result).toEqual(mockWorkspace)
    })

    it('should handle errors when adding shipment', async () => {
      const shipment = {
        description: 'Test shipment',
        orderNumber: 'ORDER-123',
        cost: 10000
      }

      mockedAxios.post.mockRejectedValueOnce(new Error('Network error'))

      await expect(DosspaceApi.addShipmentToTable('1', 'table-1', shipment)).rejects.toThrow(
        'Unable to add shipment to table'
      )
    })
  })

  describe('deleteShipment', () => {
    it('should delete a shipment', async () => {
      const mockWorkspace = {
        id: '1',
        title: 'Test Workspace',
        buildShipments: []
      }

      mockedAxios.delete.mockResolvedValueOnce({ data: { workspace: mockWorkspace } })

      const result = await DosspaceApi.deleteShipment('1', 'table-1', 'shipment-1')

      expect(mockedAxios.delete).toHaveBeenCalledWith(
        'http://localhost:8080/1/tables/table-1/shipments/shipment-1'
      )
      expect(result).toEqual(mockWorkspace)
    })

    it('should handle errors when deleting shipment', async () => {
      mockedAxios.delete.mockRejectedValueOnce(new Error('Network error'))

      await expect(DosspaceApi.deleteShipment('1', 'table-1', 'shipment-1')).rejects.toThrow(
        'Unable to delete shipment'
      )
    })
  })

  describe('deleteTable', () => {
    it('should delete a table', async () => {
      const mockWorkspace = {
        id: '1',
        title: 'Test Workspace',
        buildShipments: []
      }

      mockedAxios.delete.mockResolvedValueOnce({ data: { workspace: mockWorkspace } })

      const result = await DosspaceApi.deleteTable('1', 'table-1')

      expect(mockedAxios.delete).toHaveBeenCalledWith(
        'http://localhost:8080/1/tables/table-1'
      )
      expect(result).toEqual(mockWorkspace)
    })

    it('should handle errors when deleting table', async () => {
      mockedAxios.delete.mockRejectedValueOnce(new Error('Network error'))

      await expect(DosspaceApi.deleteTable('1', 'table-1')).rejects.toThrow(
        'Unable to delete table'
      )
    })
  })
})
