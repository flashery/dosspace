import React, { useState } from 'react'
import { DetailWorkspace } from './WorkspaceDetails'
import DosspaceApi from '../api'
import Modal from './Modal'

interface AddShipmentFormProps {
  workspaceId: string
  tableId: string
  isOpen: boolean
  onShipmentAdded: (workspace: DetailWorkspace) => void
  onClose: () => void
}

interface ShipmentInput {
  description: string
  orderNumber: string
  cost: string
}

export default function AddShipmentForm({ 
  workspaceId, 
  tableId, 
  isOpen,
  onShipmentAdded, 
  onClose 
}: AddShipmentFormProps) {
  const [shipment, setShipment] = useState<ShipmentInput>({
    description: '',
    orderNumber: '',
    cost: ''
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const costInCents = Math.round(parseFloat(shipment.cost) * 100)
    if (isNaN(costInCents)) {
      alert('Please enter a valid cost')
      return
    }

    try {
      const updatedWorkspace = await DosspaceApi.addShipmentToTable(
        workspaceId, 
        tableId, 
        {
          description: shipment.description,
          orderNumber: shipment.orderNumber,
          cost: costInCents
        }
      )
      onShipmentAdded(updatedWorkspace)
      // Reset form
      setShipment({
        description: '',
        orderNumber: '',
        cost: ''
      })
    } catch (err) {
      console.error('Failed to add shipment:', err)
      alert('Failed to add shipment. Please try again.')
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Add New Shipment"
    >
      <form onSubmit={handleSubmit}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <input
            type="text"
            value={shipment.description}
            onChange={(e) => setShipment(prev => ({ ...prev, description: e.target.value }))}
            placeholder="Description (e.g. 64 units)"
            style={{
              padding: '8px',
              borderRadius: '4px',
              border: '1px solid #ccc',
              fontSize: '16px',
            }}
            required
          />
          <input
            type="text"
            value={shipment.orderNumber}
            onChange={(e) => setShipment(prev => ({ ...prev, orderNumber: e.target.value }))}
            placeholder="Order number"
            style={{
              padding: '8px',
              borderRadius: '4px',
              border: '1px solid #ccc',
              fontSize: '16px',
            }}
            required
          />
          <input
            type="number"
            value={shipment.cost}
            onChange={(e) => setShipment(prev => ({ ...prev, cost: e.target.value }))}
            placeholder="Cost in dollars (e.g. 1076.43)"
            step="0.01"
            min="0"
            style={{
              padding: '8px',
              borderRadius: '4px',
              border: '1px solid #ccc',
              fontSize: '16px',
            }}
            required
          />
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '8px' }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                backgroundColor: '#666',
                color: 'white',
                padding: '8px 16px',
                borderRadius: '4px',
                border: 'none',
                cursor: 'pointer',
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              style={{
                backgroundColor: '#008952',
                color: 'white',
                padding: '8px 16px',
                borderRadius: '4px',
                border: 'none',
                cursor: 'pointer',
              }}
            >
              Add Shipment
            </button>
          </div>
        </div>
      </form>
    </Modal>
  )
}
