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
  whiteSpace: 'nowrap',
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

const ReturnsAndRefunds = () => {
  const [returnsData, setReturnsData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Fetch returns data
  useEffect(() => {
    fetchReturns()
  }, [])

  const fetchReturns = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await axios.get(`${Config.baseUrl}/returns`, Config.AxiosConfig())

      if (response.data && response.data.success) {
        setReturnsData(response.data.data || [])
      } else {
        setError('Failed to fetch returns.')
      }
    } catch (err) {
      console.error('Error fetching returns:', err)
      setError(err.response?.data?.message || err.message || 'An error occurred while fetching returns.')
    } finally {
      setLoading(false)
    }
  }

  // Function to format date string
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A'
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    } catch (e) {
      return dateString
    }
  }

  // Function to get status badge
  const getStatusBadge = (status) => {
    const statusLower = (status || '').toLowerCase()
    let color = 'secondary'
    
    switch (statusLower) {
      case 'approved':
        color = 'success'
        break
      case 'rejected':
        color = 'danger'
        break
      case 'pending':
        color = 'warning'
        break
      case 'returned':
        color = 'success'
        break
      default:
        color = 'secondary'
    }

    return (
      <CBadge 
        color={color}
        style={{ fontSize: '11px', fontWeight: '500', padding: '4px 8px', textTransform: 'capitalize' }}
      >
        {status}
      </CBadge>
    )
  }

  if (loading) {
    return (
      <div className="text-center py-5">
        <CSpinner color="primary" />
        <p className="text-medium-emphasis mt-2" style={{ fontSize: '14px' }}>Loading returns...</p>
      </div>
    )
  }
  
  if (error) {
    return (
      <CCard className="mb-4">
        <CCardBody>
          <div className="text-center text-danger py-4">
            <p>{error}</p>
            <CButton color="primary" size="sm" onClick={fetchReturns}>Retry</CButton>
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
              Returns & Refunds
            </h4>
          </CCardHeader>
          <CCardBody className="p-0">
            <div className="table-responsive">
              <CTable align="middle" className="mb-0 border" hover responsive>
                <CTableHead color="light">
                  <CTableRow>
                    <CTableHeaderCell style={headerStyle}>ID</CTableHeaderCell>
                    <CTableHeaderCell style={headerStyle}>User ID</CTableHeaderCell>
                    <CTableHeaderCell style={headerStyle}>Order ID</CTableHeaderCell>
                    <CTableHeaderCell style={headerStyle}>Product ID</CTableHeaderCell>
                    <CTableHeaderCell style={headerStyle}>Reason</CTableHeaderCell>
                    <CTableHeaderCell style={headerStyle}>Description</CTableHeaderCell>
                    <CTableHeaderCell style={headerStyle} className="text-center">Status</CTableHeaderCell>
                    <CTableHeaderCell style={headerStyle}>Refund Amount</CTableHeaderCell>
                    <CTableHeaderCell style={headerStyle} className="text-center">Images</CTableHeaderCell>
                    <CTableHeaderCell style={headerStyle}>Created At</CTableHeaderCell>
                    <CTableHeaderCell style={headerStyle}>Updated At</CTableHeaderCell>
                  </CTableRow>
                </CTableHead>
                <CTableBody>
                  {returnsData.length > 0 ? (
                    returnsData.map((item) => (
                      <CTableRow key={item.id}>
                        <CTableDataCell>
                          <span style={textStyle}>{item.id}</span>
                        </CTableDataCell>
                        <CTableDataCell>
                          <span style={textStyle}>{item.user_id}</span>
                        </CTableDataCell>
                        <CTableDataCell>
                          <span style={textStyle}>{item.order_id}</span>
                        </CTableDataCell>
                        <CTableDataCell>
                          <span style={textStyle}>{item.product_id}</span>
                          <div style={{ fontSize: '12px', color: '#6c757d' }}>
                            {item.product?.name || '-'}
                          </div>
                        </CTableDataCell>
                        <CTableDataCell>
                          <span style={textStyle}>{item.reason}</span>
                        </CTableDataCell>
                        <CTableDataCell>
                           <span style={textStyle} title={item.description}>
                             {item.description || '-'}
                           </span>
                        </CTableDataCell>
                        <CTableDataCell className="text-center">
                          {getStatusBadge(item.status)}
                        </CTableDataCell>
                        <CTableDataCell>
                          <span style={textStyle}>
                            Rs. {parseFloat(item.refund_amount || 0).toFixed(2)}
                          </span>
                        </CTableDataCell>
                        <CTableDataCell className="text-center">
                          <span style={textStyle}>{item.images ? item.images.length : 0}</span>
                        </CTableDataCell>
                        <CTableDataCell>
                           <span style={textStyle}>{formatDate(item.createdAt)}</span>
                        </CTableDataCell>
                        <CTableDataCell>
                           <span style={textStyle}>{formatDate(item.updatedAt)}</span>
                        </CTableDataCell>
                      </CTableRow>
                    ))
                  ) : (
                    <CTableRow>
                      <CTableDataCell colSpan="11" className="text-center py-4" style={{ fontSize: '14px', fontWeight: '400', color: '#6c757d' }}>
                        No return requests found.
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

export default ReturnsAndRefunds