import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import DosspaceApi from '../api'
import AddTableForm from './AddTableForm'
import AddShipmentForm from './AddShipmentForm'

interface Shipment {
  id: string
  description: string
  orderNumber: string
  cost: number
}

interface ShipmentTable {
  id: string
  buildNumber: string
  shipments: Shipment[]
}

export interface DetailWorkspace {
  id: string
  title: string
  buildShipments: ShipmentTable[]
}

type WorkspaceDetailsParams = {
  workspaceId: string
}

/** Detail view of individual workspace */
export default function WorkspaceDetails() {
  const { workspaceId } = useParams() as WorkspaceDetailsParams
  const [workspace, setWorkspace] = useState<DetailWorkspace | null>(null)
  const [isAddingTable, setIsAddingTable] = useState(false)
  const [addingShipmentToTableId, setAddingShipmentToTableId] = useState<string | null>(null)

  // Fetch all workspaces from the API
  useEffect(() => {
    async function fetchWorkspace() {
      const workspace = await DosspaceApi.getWorkspace(workspaceId)
      setWorkspace(workspace)
    }

    fetchWorkspace()
  }, [workspaceId])

  const handleDeleteShipment = async (tableId: string, shipmentId: string) => {
    if (!workspace || !window.confirm('Are you sure you want to delete this shipment?')) return

    try {
      const updatedWorkspace = await DosspaceApi.deleteShipment(workspace.id, tableId, shipmentId)
      setWorkspace(updatedWorkspace)
    } catch (err) {
      console.error('Failed to delete shipment:', err)
      alert('Failed to delete shipment. Please try again.')
    }
  }

  const handleDeleteTable = async (tableId: string) => {
    if (!workspace || !window.confirm('Are you sure you want to delete this table?')) return

    try {
      const updatedWorkspace = await DosspaceApi.deleteTable(workspace.id, tableId)
      setWorkspace(updatedWorkspace)
    } catch (err) {
      console.error('Failed to delete table:', err)
      alert('Failed to delete table. Please try again.')
    }
  }

  if (!workspace) {
    return <div>Loading...</div>
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1>{workspace.title}</h1>
        <button
          onClick={() => setIsAddingTable(true)}
          style={{
            backgroundColor: '#008952',
            color: 'white',
            padding: '8px 16px',
            borderRadius: '4px',
            border: 'none',
            cursor: 'pointer',
          }}
        >
          Add Table
        </button>
      </div>

      <AddTableForm
        workspaceId={workspace.id}
        isOpen={isAddingTable}
        onTableAdded={(updatedWorkspace) => {
          setWorkspace(updatedWorkspace)
          setIsAddingTable(false)
        }}
        onClose={() => setIsAddingTable(false)}
      />

      {workspace.buildShipments.map((buildShipment) => (
        <div key={buildShipment.id} style={{ marginBottom: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2>Build: {buildShipment.buildNumber}</h2>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button
                onClick={() => setAddingShipmentToTableId(buildShipment.id)}
                style={{
                  backgroundColor: '#008952',
                  color: 'white',
                  padding: '4px 12px',
                  borderRadius: '4px',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '14px',
                }}
              >
                Add Shipment
              </button>
              <button
                onClick={() => handleDeleteTable(buildShipment.id)}
                style={{
                  backgroundColor: '#dc3545',
                  color: 'white',
                  padding: '4px 12px',
                  borderRadius: '4px',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '14px',
                }}
              >
                Delete Table
              </button>
            </div>
          </div>

          <AddShipmentForm
            workspaceId={workspace.id}
            tableId={buildShipment.id}
            isOpen={addingShipmentToTableId === buildShipment.id}
            onShipmentAdded={(updatedWorkspace) => {
              setWorkspace(updatedWorkspace)
              setAddingShipmentToTableId(null)
            }}
            onClose={() => setAddingShipmentToTableId(null)}
          />

          <table style={{
            width: '100%',
            borderCollapse: 'collapse',
            marginTop: '1rem',
          }}>
            <thead>
              <tr style={{ backgroundColor: '#f5f5f5' }}>
                <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '2px solid #ddd' }}>Description</th>
                <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '2px solid #ddd' }}>Order Number</th>
                <th style={{ padding: '1rem', textAlign: 'right', borderBottom: '2px solid #ddd' }}>Cost</th>
                <th style={{ padding: '1rem', textAlign: 'center', borderBottom: '2px solid #ddd' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {buildShipment.shipments.map((shipment) => (
                <tr key={shipment.id}>
                  <td style={{ padding: '1rem', borderBottom: '1px solid #ddd' }}>{shipment.description}</td>
                  <td style={{ padding: '1rem', borderBottom: '1px solid #ddd' }}>{shipment.orderNumber}</td>
                  <td style={{ padding: '1rem', textAlign: 'right', borderBottom: '1px solid #ddd' }}>
                    ${(shipment.cost / 100).toFixed(2)}
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'center', borderBottom: '1px solid #ddd' }}>
                    <button
                      onClick={() => handleDeleteShipment(buildShipment.id, shipment.id)}
                      style={{
                        backgroundColor: '#dc3545',
                        color: 'white',
                        padding: '4px 8px',
                        borderRadius: '4px',
                        border: 'none',
                        cursor: 'pointer',
                        fontSize: '12px',
                      }}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
              {buildShipment.shipments.length > 0 && (
                <tr>
                  <td colSpan={2} style={{ padding: '1rem', textAlign: 'right', fontWeight: 'bold' }}>Total:</td>
                  <td style={{ padding: '1rem', textAlign: 'right', fontWeight: 'bold' }}>
                    ${(buildShipment.shipments.reduce((acc, s) => acc + s.cost, 0) / 100).toFixed(2)}
                  </td>
                  <td></td>
                </tr>
              )}
              {buildShipment.shipments.length === 0 && (
                <tr>
                  <td colSpan={4} style={{ padding: '1rem', textAlign: 'center', color: '#666' }}>
                    No shipments yet. Click "Add Shipment" to add one.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      ))}

      {workspace.buildShipments.length === 0 && (
        <p style={{ textAlign: 'center', color: '#666' }}>
          No tables yet. Click "Add Table" to create one.
        </p>
      )}
    </div>
  )
}
