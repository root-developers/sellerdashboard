import React, { useState, useEffect, useMemo, useCallback } from 'react'
import axios from 'axios'
import { useSelector } from 'react-redux'
import {
  CAvatar,
  CButton,
  CCard,
  CCardBody,
  CCardFooter,
  CCardHeader,
  CCol,
  CFormInput,
  CRow,
  CTable,
  CTableBody,
  CTableDataCell,
  CTableHead,
  CTableHeaderCell,
  CTableRow,
  CSpinner,
  CPagination,
  CPaginationItem,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import {
  cilSearch,
  cilFilter,
  cilArrowTop,
  cilArrowBottom,
  cilSwapVertical,
  cilFullscreen,
} from '@coreui/icons'
import Config from '../../../config/Config'

// Style Constants for Consistency
const textStyle = {
  fontSize: '14px',
  fontWeight: '500',
  color: '#2c3e50',
  letterSpacing: '-0.01em',
}
const subTextStyle = {
  fontSize: '13px',
  color: 'black',
  fontWeight: '400',
  maxWidth: '200px',
  display: 'block',
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
}
const subHeaderStyle = {
  fontSize: '14px',
  fontWeight: '600',
  textTransform: 'uppercase',
  color: 'black',
  letterSpacing: '0.5px',
  // maxWidth: '30px',
  // whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
}

// function to format date
const formatDate = (dateString) => {
  if (!dateString) return 'N/A'
  try {
    const options = { year: 'numeric', month: 'short', day: 'numeric' }
    return new Date(dateString).toLocaleDateString('en-US', options)
  } catch (e) {
    return dateString // Fallback
  }
}

// StatCard Component
const StatCard = React.memo(({ value, description }) => (
  <CCol sm={6} lg={4}>
    <CCard className="mb-4">
      <CCardBody>
        <div className="d-flex justify-content-between align-items-start">
          <div>
            <h2 className="mb-0 fw-semibold">{value.toLocaleString()}</h2>
            <p className="text-medium-emphasis small my-1">{description}</p>
          </div>
        </div>
      </CCardBody>
    </CCard>
  </CCol>
))
StatCard.displayName = 'StatCard'

// SellerRow Component
const SellerRow = React.memo(({ seller }) => {
  return (
    <CTableRow>
      <CTableDataCell style={{ width: '50px' }}>
        <span style={subTextStyle}>{seller.id}</span>
      </CTableDataCell>
      <CTableDataCell className="text-center" style={{ width: '60px' }}>
        <CAvatar
          size="md"
          color="primary"
          textColor="white"
          src={seller.profile_image || undefined}
        >
          {/* Fallback to initials if no profile image */}
          {!seller.profile_image ? (seller.first_name || '?')[0].toUpperCase() : null}
        </CAvatar>
      </CTableDataCell>
      <CTableDataCell>
        <div style={subTextStyle}>{`${seller.first_name || ''} ${seller.last_name || ''}`}</div>
      </CTableDataCell>
      <CTableDataCell>
        <span style={subTextStyle}>{seller.email || 'N/A'}</span>
      </CTableDataCell>
      <CTableDataCell>
        <span style={subTextStyle}>{seller.phone || 'N/A'}</span>
      </CTableDataCell>
      <CTableDataCell>
        <span style={subTextStyle}>{seller.company_name || 'N/A'}</span>
      </CTableDataCell>
      <CTableDataCell>
        <span style={subTextStyle}>{seller.company_description || 'N/A'}</span>
      </CTableDataCell>
      <CTableDataCell>
        <span style={subTextStyle}>{seller.tax_id || 'N/A'}</span>
      </CTableDataCell>
      <CTableDataCell>
        <span style={subTextStyle}>{formatDate(seller.created_at)}</span>
      </CTableDataCell>
      <CTableDataCell>
        <span style={subTextStyle}>{formatDate(seller.last_login)}</span>
      </CTableDataCell>
    </CTableRow>
  )
})
SellerRow.displayName = 'SellerRow'

// Main AllSellers Component
const AllSellers = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Sellers data from API
  const [sellers, setSellers] = useState([])

  // Pagination state
  const [pagination, setPagination] = useState(null)
  const [currentPage, setCurrentPage] = useState(1)

  // Get user from Redux store
  const user = useSelector((state) => state.UserReducer.user)
  const role = user?.role

  // Fetch sellers from API 
  useEffect(() => {
    fetchAllSellers(currentPage)
  }, [currentPage]) //Re-fetch when currentPage changes

  // GET /products/getAllSellers - Fetch all sellers
  const fetchAllSellers = async (page = 1) => {
    try {
      setLoading(true)
      setError(null)
      const response = await axios.get(
        `${Config.baseUrl}/products/getAllSellers?page=${page}`,
        Config.AxiosConfig(),
      )

      if (response.data && response.data.success) {
        const sellersData = response.data.data.sellers || []
        setSellers(sellersData)
        setPagination(response.data.data.pagination || null) // Set pagination data
      } else {
        setSellers([])
        setPagination(null) // Reset pagination on error
        setError('Failed to fetch sellers')
      }
    } catch (err) {
      console.error('Error fetching sellers:', err)
      setError(err.response?.data?.message || err.message || 'Failed to load sellers')
      setSellers([])
      setPagination(null) // Reset pagination on error
    } finally {
      setLoading(false)
    }
  }

  // Memoized stats for sellers based on API data
  const stats = useMemo(() => {
    return {
      totalSellers: pagination ? pagination.total_items : 0,
      sellersThisPage: sellers.length,
      totalPages: pagination ? pagination.total_pages : 0,
    }
  }, [sellers, pagination])

  // Filtered sellers with search
  const filteredSellers = useMemo(() => {
    if (!searchTerm.trim()) return sellers // Use 'sellers' array directly

    const searchLower = searchTerm.toLowerCase()
    return sellers.filter(
      (seller) =>
        (seller.id || '').toString().includes(searchLower) ||
        (seller.first_name || '').toLowerCase().includes(searchLower) ||
        (seller.last_name || '').toLowerCase().includes(searchLower) ||
        (seller.email || '').toLowerCase().includes(searchLower) ||
        (seller.company_name || '').toLowerCase().includes(searchLower) ||
        (seller.phone || '').toLowerCase().includes(searchLower) ||
        (seller.tax_id || '').toString().toLowerCase().includes(searchLower) ||
        (seller.created_at || '').toLowerCase().includes(searchLower) ||
        (seller.company_description || '').toLowerCase().includes(searchLower)

    )
  }, [sellers, searchTerm])

  const handlePageChange = (pageNumber) => {
    if (
      pageNumber < 1 ||
      !pagination ||
      pageNumber > pagination.total_pages ||
      pageNumber === currentPage
    ) {
      return
    }
    setCurrentPage(pageNumber)
  }

  if (loading) {
    return (
      <div className="text-center py-5">
        <CSpinner color="primary" />
        <p className="mt-3">Loading sellers...</p>
      </div>
    )
  }

  if (error) {
    return (
      <CCard>
        <CCardBody>
          <div className="text-center text-danger py-4">
            <p>{error}</p>
            <CButton color="primary" onClick={() => fetchAllSellers(1)}>
              Retry
            </CButton>
          </div>
        </CCardBody>
      </CCard>
    )
  }

  return (
    <>
      {/* Stats Cards */}
      <CRow className="mb-4">
        <StatCard value={stats.totalSellers} description="Total Registered Sellers" />
        <StatCard value={stats.sellersThisPage} description="Sellers on This Page" />
        <StatCard value={stats.totalPages} description="Total Pages" />
      </CRow>

      {/* Sellers Table */}
      <CCard>
        <CCardHeader>
          <CRow className="align-items-center">
            <CCol xs={12} md={6}>
              <h5 className="mb-0 fw-semibold" style={{ fontSize: '18px', letterSpacing: '-0.02em' }}>
                Sellers List
              </h5>
            </CCol>
            <CCol xs={12} md={6} className="text-md-end mt-2 mt-md-0">
              <div className="d-flex gap-2 flex-column flex-md-row justify-content-md-end">
                <div className="position-relative">
                  <CFormInput
                    type="text"
                    placeholder="Search by name, email, phone, company..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pe-5"
                    style={{ fontSize: '14px' }}
                  />
                  <CIcon
                    icon={cilSearch}
                    className="position-absolute top-50 end-0 translate-middle-y me-2"
                    style={{ pointerEvents: 'none' }}
                  />
                </div>
                <CButton color="light" style={{ fontSize: '14px', fontWeight: '500' }}>
                  <CIcon icon={cilFilter} /> Filter
                </CButton>
                <CButton color="light" style={{ fontSize: '14px', fontWeight: '500' }}>
                  <CIcon icon={cilSwapVertical} /> Sort By
                </CButton>
                <CButton color="success" style={{ fontSize: '14px', fontWeight: '500' }}>
                  <CIcon icon={cilFullscreen} />
                </CButton>
              </div>
            </CCol>
          </CRow>
        </CCardHeader>
        <CCardBody className="p-0">
          <div className="table-responsive">
            <CTable align="middle" className="mb-0" hover>
              <CTableHead color="light">
                <CTableRow>
                  <CTableHeaderCell style={{ ...subHeaderStyle, width: '50px' }}>
                    ID
                  </CTableHeaderCell>
                  <CTableHeaderCell
                    style={{ ...subHeaderStyle, width: '70px' }}
                    className="text-center"
                  >
                    Profile Image
                  </CTableHeaderCell>
                  <CTableHeaderCell style={subHeaderStyle}>Seller Name</CTableHeaderCell>
                  <CTableHeaderCell style={subHeaderStyle}>Email</CTableHeaderCell>
                  <CTableHeaderCell style={subHeaderStyle}>Phone</CTableHeaderCell>
                  <CTableHeaderCell style={subHeaderStyle}>Company Name</CTableHeaderCell>
                  <CTableHeaderCell style={subHeaderStyle}>Description</CTableHeaderCell>
                  <CTableHeaderCell style={subHeaderStyle}>Tax ID</CTableHeaderCell>
                  <CTableHeaderCell style={subHeaderStyle}>Joined Date</CTableHeaderCell>
                  <CTableHeaderCell style={subHeaderStyle}>Last Login</CTableHeaderCell>
                </CTableRow>
              </CTableHead>
              <CTableBody>
                {filteredSellers.length > 0 ? (
                  filteredSellers.map((seller) => (
                    <SellerRow
                      key={seller.id}
                      seller={seller}
                    />
                  ))
                ) : (
                  <CTableRow>
                    <CTableDataCell
                      colSpan="10"
                      className="text-center py-4"
                      style={subTextStyle}
                    >
                      No sellers found
                    </CTableDataCell>
                  </CTableRow>
                )}
              </CTableBody>
            </CTable>
          </div>
        </CCardBody>
        {/* Pagination Footer */}
        {pagination && pagination.total_pages > 1 && (
          <CCardFooter>
            <CPagination align="end" aria-label="Page navigation">
              <CPaginationItem
                disabled={currentPage === 1}
                onClick={() => handlePageChange(currentPage - 1)}
                aria-label="Previous"
              >
                <span aria-hidden="true">&laquo;</span>
              </CPaginationItem>
              {[...Array(pagination.total_pages).keys()].map((page) => (
                <CPaginationItem
                  key={page + 1}
                  active={page + 1 === currentPage}
                  onClick={() => handlePageChange(page + 1)}
                >
                  {page + 1}
                </CPaginationItem>
              ))}
              <CPaginationItem
                disabled={currentPage === pagination.total_pages}
                onClick={() => handlePageChange(currentPage + 1)}
                aria-label="Next"
              >
                <span aria-hidden="true">&raquo;</span>
              </CPaginationItem>
            </CPagination>
          </CCardFooter>
        )}
      </CCard>

    </>
  )
}

export default AllSellers