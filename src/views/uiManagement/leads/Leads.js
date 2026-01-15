import React, { useState, useEffect } from 'react'
import axios from 'axios'
import {
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CRow,
  CTable,
  CTableBody,
  CTableDataCell,
  CTableHead,
  CTableHeaderCell,
  CTableRow,
  CSpinner,
  CBadge,
  CButton,
} from '@coreui/react'
import Config from '../../../config/Config'

const headerStyle = {
  fontSize: '14px',
  fontWeight: '600',
  color: 'black',
  letterSpacing: '0.5px',
  textOverflow: 'ellipsis',
  overflow: 'hidden',
}

const textStyle = {
  fontSize: '13px',
  color: 'black',
  fontWeight: '400',
  maxWidth: '200px',
  display: 'block',
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis'
}

const Leads = () => {
  const [leads, setLeads] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Fetch leads
  useEffect(() => {
    fetchLeads()
  }, [])

  const fetchLeads = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await axios.get(`${Config.baseUrl}/leads/all`, Config.AxiosConfig())

      if (response.data && response.data.success) {
        setLeads(response.data.data.leads || [])
      } else {
        setError('Failed to fetch leads.')
      }
    } catch (err) {
      console.error('Error fetching leads:', err)
      setError(err.response?.data?.errors && err.response.data.errors.length > 0 ? err.response.data.errors[0].message : 'An error occurred while fetching leads.')
    } finally {
      setLoading(false)
    }
  }

  // Function to format date string
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  // Loading
  if (loading) {
    return (
      <div className="text-center py-5">
        <CSpinner color="primary" />
        <p className="text-medium-emphasis mt-2" style={{ fontSize: '14px' }}>Loading leads...</p>
      </div>
    )
  }

  if (error) {
    return (
      <CCard className="mb-4">
        <CCardBody>
          <div className="text-center text-danger py-4">
            <p>{error}</p>
            <CButton color="primary" size="sm" onClick={fetchLeads}>Retry</CButton>
          </div>
        </CCardBody>
      </CCard>
    )
  }

  return (
    <CRow>
      <CCol xs={12}>
        <CCard className="mb-4">
          <CCardHeader>
            <h4 className="mb-0 fw-semibold" style={{ fontSize: '18px', letterSpacing: '-0.02em' }}>
              Leads
            </h4>
          </CCardHeader>
          <CCardBody className="p-0">
            <div className="table-responsive">
              <CTable align="middle" className="mb-0 border" hover responsive>
                <CTableHead color="light">
                  <CTableRow>
                    <CTableHeaderCell style={headerStyle}>ID</CTableHeaderCell>
                    <CTableHeaderCell style={headerStyle}>Name</CTableHeaderCell>
                    <CTableHeaderCell style={headerStyle}>Email</CTableHeaderCell>
                    <CTableHeaderCell style={headerStyle}>Contact</CTableHeaderCell>
                    <CTableHeaderCell style={headerStyle} className="text-center">Status</CTableHeaderCell>
                    <CTableHeaderCell style={headerStyle}>Created At</CTableHeaderCell>
                  </CTableRow>
                </CTableHead>
                <CTableBody>
                  {leads.length > 0 ? (
                    leads.map((lead) => (
                      <CTableRow key={lead.id}>
                        <CTableDataCell>
                          <span style={textStyle}>{lead.id}</span>
                        </CTableDataCell>
                        <CTableDataCell>
                          <span style={textStyle}>{lead.name}</span>
                        </CTableDataCell>
                        <CTableDataCell>
                          <span style={textStyle}>{lead.email}</span>
                        </CTableDataCell>
                        <CTableDataCell>
                          <span style={textStyle}>{lead.contact}</span>
                        </CTableDataCell>
                        <CTableDataCell className="text-center">
                          <CBadge 
                            color={lead.is_active ? 'success' : 'secondary'}
                            style={{ fontSize: '11px', fontWeight: '500', padding: '4px 6px' }}
                          >
                            {lead.is_active ? 'Active' : 'Inactive'}
                          </CBadge>
                        </CTableDataCell>
                        <CTableDataCell>
                           <span style={textStyle}>{formatDate(lead.createdAt)}</span>
                        </CTableDataCell>
                      </CTableRow>
                    ))
                  ) : (
                    <CTableRow>
                      <CTableDataCell colSpan="6" className="text-center py-4" style={{ fontSize: '14px', fontWeight: '400', color: '#6c757d' }}>
                        No leads found
                      </CTableDataCell>
                    </CTableRow>
                  )}
                </CTableBody>
              </CTable>
            </div>
          </CCardBody>
        </CCard>
      </CCol>
    </CRow>
  )
}

export default Leads