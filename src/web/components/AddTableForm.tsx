import React, { useState } from 'react'
import DosspaceApi from '../api'
import { DetailWorkspace } from './WorkspaceDetails'
import Modal from './Modal'

interface AddTableFormProps {
  workspaceId: string
  isOpen: boolean
  onTableAdded: (workspace: DetailWorkspace) => void
  onClose: () => void
}

export default function AddTableForm({ 
  workspaceId, 
  isOpen,
  onTableAdded, 
  onClose 
}: AddTableFormProps) {
  const [newBuildNumber, setNewBuildNumber] = useState('')

  const handleAddTable = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newBuildNumber.trim()) return

    try {
      const updatedWorkspace = await DosspaceApi.addTableToWorkspace(workspaceId, newBuildNumber)
      onTableAdded(updatedWorkspace)
      setNewBuildNumber('')
    } catch (err) {
      console.error('Failed to add table:', err)
      alert('Failed to add table. Please try again.')
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Add New Table"
    >
      <form onSubmit={handleAddTable}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <input
            type="text"
            value={newBuildNumber}
            onChange={(e) => setNewBuildNumber(e.target.value)}
            placeholder="Enter build number"
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
              Add Table
            </button>
          </div>
        </div>
      </form>
    </Modal>
  )
}
