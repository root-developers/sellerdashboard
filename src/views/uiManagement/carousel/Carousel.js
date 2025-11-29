import React, { useState, useEffect, useCallback } from 'react'
import axios from 'axios'
import { toast } from 'react-toastify'
import { useSelector } from 'react-redux'
import {
  CButton,
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
  CFormSwitch,
  CImage,
  CLink,
  CDropdown,
  CDropdownToggle,
  CDropdownMenu,
  CDropdownItem,
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CCollapse,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import {
  cilOptions,
  cilPencil,
  cilTrash,
  cilPlus,
  cilX,
} from '@coreui/icons'
import Config from '../../../config/Config'
import AddCarouselForm from '../../../components/carousels/AddCarouselForm'
import EditCarouselForm from '../../../components/carousels/EditCarouselForm'

// Style Constants
const subHeaderStyle = {
  fontSize: '14px',
  fontWeight: '600',
  textTransform: 'uppercase',
  color: 'black',
  letterSpacing: '0.5px',
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

// Single Carousel Row Component
const CarouselRow = React.memo(
  ({ item, onRefresh, onEdit, onStatusChange, isChangingStatus }) => {
    const [isDeleting, setIsDeleting] = useState(false)
    const user = useSelector((state) => state.UserReducer.user)

    const handleDelete = async () => {
      if (!window.confirm(`Are you sure you want to delete "${item.title || 'this slide'}"?`)) return
      setIsDeleting(true)
      try {
        await axios.delete(`${Config.baseUrl}/carousels/${item.id}`, Config.AxiosConfig())
        toast.success('Carousel slide deleted successfully')
        onRefresh()
      } catch (error) {
        toast.error(error.response?.data?.message || 'Failed to delete slide')
      } finally {
        setIsDeleting(false)
      }
    }

    return (
      <CTableRow>
        <CTableDataCell>
          <span style={subTextStyle}>{item.id}</span>
        </CTableDataCell>
        <CTableDataCell className="text-center">
          <CImage
            src={item.image_url}
            alt={item.title}
            style={{ width: '100px', height: '50px', objectFit: 'contain', borderRadius: '4px' }}
          />
        </CTableDataCell>
        <CTableDataCell>
          <span style={subTextStyle} title={item.title}>
            {item.title || 'N/A'}
          </span>
        </CTableDataCell>
        <CTableDataCell>
          <CLink
            href={item.link_url}
            target="_blank"
            rel="noopener noreferrer"
            style={subTextStyle}
          >
            {item.link_url || 'N/A'}
          </CLink>
        </CTableDataCell>
        <CTableDataCell>
          <span style={subTextStyle}>{formatDate(item.createdAt)}</span>
        </CTableDataCell>
        <CTableDataCell className="text-center">
          <CFormSwitch
            id={`status-switch-${item.id}`}
            checked={item.is_active}
            disabled={isChangingStatus}
            onChange={() => onStatusChange(item.id, !item.is_active)}
          />
        </CTableDataCell>
        <CTableDataCell className="text-center">
          <CDropdown alignment="end">
            <CDropdownToggle color="ghost" size="sm" caret={false} disabled={isDeleting}>
              {isDeleting ? <CSpinner size="sm" /> : <CIcon icon={cilOptions} />}
            </CDropdownToggle>
            <CDropdownMenu>
              <CDropdownItem onClick={() => onEdit(item)} style={subTextStyle}>
                <CIcon icon={cilPencil} className="me-2" />
                Edit
              </CDropdownItem>
              <CDropdownItem onClick={handleDelete} disabled={isDeleting} className="text-danger">
                <CIcon icon={cilTrash} className="me-2" />
                {isDeleting ? 'Deleting...' : 'Delete'}
              </CDropdownItem>
            </CDropdownMenu>
          </CDropdown>
        </CTableDataCell>
      </CTableRow>
    )
  },
)
CarouselRow.displayName = 'CarouselRow'

// Main Carousel Component
const Carousel = () => {
  const [carousels, setCarousels] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isChangingStatus, setIsChangingStatus] = useState(false)
  const [refreshTrigger, setRefreshTrigger] = useState(0)
  const [showAddForm, setShowAddForm] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [selectedCarousel, setSelectedCarousel] = useState(null)

  // Fetch carousels from API
  const fetchCarousels = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await axios.get(`${Config.baseUrl}/carousels`, Config.AxiosConfig())

      if (response.data && response.data.success) {
        setCarousels(response.data.data || [])
      } else {
        setCarousels([])
        setError('Failed to fetch carousel slides')
      }
    } catch (err) {
      console.error('Error fetching carousels:', err)
      setError(err.response?.data?.message || 'Failed to load carousel slides')
      setCarousels([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchCarousels()
  }, [refreshTrigger, fetchCarousels])

  const handleRefresh = () => {
    setRefreshTrigger((prev) => prev + 1)
  }

  const handleEditClick = (item) => {
    setSelectedCarousel(item)
    setShowEditModal(true)
  }

  const handleCloseModals = () => {
    setShowAddForm(false)
    setShowEditModal(false)
    setSelectedCarousel(null)
  }

  // Handle status change
  const handleStatusChange = async (id, newStatus) => {
    setIsChangingStatus(true) // Disable the switch
    try {
      const statusValue = newStatus ? 1 : 0 // Convert boolean to 0 or 1
      await axios.put(
        `${Config.baseUrl}/carousels/${id}?is_active=${statusValue}`,
        Config.AxiosConfig(),
      )
      window.location.reload() // Reload the page to reflect changes
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update status')
      setIsChangingStatus(false)
    }
  }

  if (loading && carousels.length === 0) {
    return (
      <div className="text-center py-5">
        <CSpinner color="primary" />
        <p className="mt-3">Loading carousels...</p>
      </div>
    )
  }

  if (error) {
    return (
      <CCard>
        <CCardBody>
          <div className="text-center text-danger py-4">
            <p>{error}</p>
            <CButton color="primary" onClick={() => fetchCarousels()}>
              Retry
            </CButton>
          </div>
        </CCardBody>
      </CCard>
    )
  }

  return (
    <>
      <CRow>
        <CCol xs={12}>
          <CCard className="mb-4">
            <CCardHeader className="d-flex justify-content-between align-items-center">
              <h5 className="mb-0 fw-semibold" style={{ fontSize: '18px' }}>
                Carousel Management
              </h5>
              <CButton
                color={showAddForm ? 'secondary' : 'success'}
                onClick={() => setShowAddForm(!showAddForm)}
                className="d-flex align-items-center"
                style={{ fontSize: '14px', fontWeight: '500' }}
              >
                <CIcon icon={showAddForm ? cilX : cilPlus} className="me-2" />
                {showAddForm ? 'Close Form' : 'Add New Slide'}
              </CButton>
            </CCardHeader>
            <CCollapse visible={showAddForm}>
              <CCardBody className="border-top">
                <AddCarouselForm
                  onAdded={() => {
                    handleCloseModals()
                    handleRefresh()
                  }}
                  onCancel={handleCloseModals}
                />
              </CCardBody>
            </CCollapse>
          </CCard>
        </CCol>

        <CCol xs={12}>
          <CCard>
            <CCardHeader>
              <h5 className="mb-0 fw-semibold" style={{ fontSize: '18px' }}>
                All Carousel Slides ({carousels.length})
              </h5>
            </CCardHeader>
            <CCardBody className="p-0">
              <div className="table-responsive">
                <CTable align="middle" className="mb-0" hover>
                  <CTableHead color="light">
                    <CTableRow>
                      <CTableHeaderCell style={subHeaderStyle}>ID</CTableHeaderCell>
                      <CTableHeaderCell style={subHeaderStyle} className="text-center">
                        Image
                      </CTableHeaderCell>
                      <CTableHeaderCell style={subHeaderStyle}>Title</CTableHeaderCell>
                      <CTableHeaderCell style={subHeaderStyle}>Link</CTableHeaderCell>
                      <CTableHeaderCell style={subHeaderStyle}>Created At</CTableHeaderCell>
                      <CTableHeaderCell style={subHeaderStyle} className="text-center">
                        Active
                      </CTableHeaderCell>
                      <CTableHeaderCell style={subHeaderStyle} className="text-center">
                        Actions
                      </CTableHeaderCell>
                    </CTableRow>
                  </CTableHead>
                  <CTableBody>
                    {loading && (
                      <CTableRow>
                        <CTableDataCell colSpan="7" className="text-center py-4">
                          <CSpinner size="sm" />
                        </CTableDataCell>
                      </CTableRow>
                    )}
                    {!loading && carousels.length > 0 ? (
                      carousels.map((item) => (
                        <CarouselRow
                          key={item.id}
                          item={item}
                          onRefresh={handleRefresh}
                          onEdit={handleEditClick}
                          onStatusChange={handleStatusChange}
                          isChangingStatus={isChangingStatus}
                        />
                      ))
                    ) : (
                      !loading && (
                        <CTableRow>
                          <CTableDataCell colSpan="7" className="text-center py-4">
                            No carousel slides found.
                          </CTableDataCell>
                        </CTableRow>
                      )
                    )}
                  </CTableBody>
                </CTable>
              </div>
            </CCardBody>

          </CCard>
        </CCol>
      </CRow>

      {/*Edit Slide Modal*/}
      <CModal size="lg" visible={showEditModal} onClose={handleCloseModals}>
        <CModalHeader>
          <CModalTitle>Edit Carousel Slide</CModalTitle>
        </CModalHeader>
        <CModalBody>
          {selectedCarousel && (
            <EditCarouselForm
              carouselToEdit={selectedCarousel}
              onUpdated={() => {
                handleCloseModals()
                handleRefresh()
              }}
              onCancel={handleCloseModals}
            />
          )}
        </CModalBody>
      </CModal>
    </>
  )
}

export default Carousel