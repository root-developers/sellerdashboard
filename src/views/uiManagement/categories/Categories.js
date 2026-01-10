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
  CDropdown,
  CDropdownToggle,
  CDropdownMenu,
  CDropdownItem,
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CCollapse,
  CImage,
  CFormSwitch,
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
import AddCategoryForm from '../../../components/categories/AddCategoryForm'
import EditCategoryForm from '../../../components/categories/EditCategoryForm'

// Style Constants
const headerStyle = {
  fontSize: '14px',
  fontWeight: '600',
  textTransform: 'uppercase',
  color: 'black',
  letterSpacing: '0.5px',
}
const textStyle = {
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

// Single Category Row Component
const CategoryRow = React.memo(
  ({ item, onRefresh, onEdit, onStatusChange, isChangingStatus }) => {
    const [isDeleting, setIsDeleting] = useState(false)
    const user = useSelector((state) => state.UserReducer.user)

    const handleDelete = async () => {
      if (!window.confirm(`Are you sure you want to delete "${item.name || 'this category'}"?`)) return
      setIsDeleting(true)
      try {
        await axios.delete(`${Config.baseUrl}/categories/${item.id}`, {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        })
        toast.success('Category deleted successfully')
        onRefresh()
      } catch (error) {
        toast.error(error.response?.data?.message || 'Failed to delete category')
      } finally {
        setIsDeleting(false)
      }
    }

    return (
      <CTableRow>
        <CTableDataCell>
          <span style={textStyle}>{item.id}</span>
        </CTableDataCell>
        <CTableDataCell className="text-center">
          <CImage
            src={item.image}
            alt={item.name}
            style={{ width: '60px', height: '60px', objectFit: 'contain', borderRadius: '4px' }}
          />
        </CTableDataCell>
        <CTableDataCell>
          <div style={textStyle}>
            {item.name}
          </div>
          {item.description && (
            <div style={{ fontSize: '12px', color: '#6c757d', marginTop: '2px', maxWidth: '150px', display: 'block', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {item.description.substring(0, 50)}
              {item.description.length > 50 ? '...' : ''}
            </div>
          )}
        </CTableDataCell>
        <CTableDataCell>
          <span style={textStyle} title={item.slug}>
            {item.slug || 'N/A'}
          </span>
        </CTableDataCell>
        <CTableDataCell>
          <span style={textStyle}>{item.sort_order}</span>
        </CTableDataCell>
        <CTableDataCell className="text-center">
          <CFormSwitch
            id={`status-switch-${item.id}`}
            checked={item.is_active || false}
            disabled={isChangingStatus}
            onChange={() => onStatusChange(item.id, !item.is_active)}
          />
        </CTableDataCell>
        <CTableDataCell>
          <span style={textStyle}>{formatDate(item.createdAt)}</span>
        </CTableDataCell>
        <CTableDataCell className="text-center">
          <CDropdown alignment="end">
            <CDropdownToggle color="ghost" size="sm" caret={false} disabled={isDeleting}>
              {isDeleting ? <CSpinner size="sm" /> : <CIcon icon={cilOptions} />}
            </CDropdownToggle>
            <CDropdownMenu>
              <CDropdownItem onClick={() => onEdit(item)} style={textStyle}>
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
CategoryRow.displayName = 'CategoryRow'

// Main Categories Component
const Categories = () => {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [refreshTrigger, setRefreshTrigger] = useState(0)
  const [showAddForm, setShowAddForm] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState(null)
  const [isChangingStatus, setIsChangingStatus] = useState(false)
  const user = useSelector((state) => state.UserReducer.user)

  // Fetch categories from API
  const fetchCategories = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await axios.get(`${Config.baseUrl}/categories`, {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      })

      if (response.data && response.data.success) {
        setCategories(response.data.data.categories || [])
      } else {
        setCategories([])
        setError('Failed to fetch categories')
      }
    } catch (err) {
      console.error('Error fetching categories:', err)
      setError(err.response?.data?.errors && err.response.data.errors.length > 0 ? err.response.data.errors[0].message : 'Failed to load categories')
      setCategories([])
    } finally {
      setLoading(false)
    }
  }, [user.token])

  useEffect(() => {
    fetchCategories()
  }, [refreshTrigger, fetchCategories])

  const handleRefresh = () => {
    setRefreshTrigger((prev) => prev + 1)
  }

  const handleEditClick = (item) => {
    setSelectedCategory(item)
    setShowEditModal(true)
  }

  const handleCloseModals = () => {
    setShowAddForm(false)
    setShowEditModal(false)
    setSelectedCategory(null)
  }

  // Handle status change
  const handleStatusChange = async (id, newStatus) => {
    setIsChangingStatus(true)
    try {
      await axios.put(
        `${Config.baseUrl}/categories/${id}`,
        { is_active: newStatus },
        {
          headers: {
            Authorization: `Bearer ${user.token}`,
            'Content-Type': 'application/json',
          },
        },
      )
      toast.success(`Category ${newStatus ? 'activated' : 'deactivated'}.`)
      handleRefresh() // Re-fetch data to show updated status
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update status')
    } finally {
      setIsChangingStatus(false)
    }
  }

  if (loading && categories.length === 0) {
    return (
      <div className="text-center py-5">
        <CSpinner color="primary" />
        <p className="mt-3">Loading categories...</p>
      </div>
    )
  }

  if (error) {
    return (
      <CCard>
        <CCardBody>
          <div className="text-center text-danger py-4">
            <p>{error}</p>
            <CButton color="primary" onClick={() => fetchCategories()}>
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
                Category Management
              </h5>
              <CButton
                color={showAddForm ? 'secondary' : 'success'}
                onClick={() => setShowAddForm(!showAddForm)}
                className="d-flex align-items-center"
                style={{ fontSize: '14px', fontWeight: '500' }}
              >
                <CIcon icon={showAddForm ? cilX : cilPlus} className="me-2" />
                {showAddForm ? 'Close Form' : 'Add New Category'}
              </CButton>
            </CCardHeader>
            <CCollapse visible={showAddForm}>
              <CCardBody className="border-top">
                <AddCategoryForm
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
                All Categories ({categories.length})
              </h5>
            </CCardHeader>
            <CCardBody className="p-0">
              <div className="table-responsive">
                <CTable align="middle" className="mb-0" hover>
                  <CTableHead color="light">
                    <CTableRow>
                      <CTableHeaderCell style={headerStyle}>ID</CTableHeaderCell>
                      <CTableHeaderCell style={headerStyle} className="text-center">Image</CTableHeaderCell>
                      <CTableHeaderCell style={headerStyle}>Name</CTableHeaderCell>
                      <CTableHeaderCell style={headerStyle}>Slug</CTableHeaderCell>
                      <CTableHeaderCell style={headerStyle}>Sort Order</CTableHeaderCell>
                      <CTableHeaderCell style={headerStyle} className="text-center">Active</CTableHeaderCell>
                      <CTableHeaderCell style={headerStyle}>Created At</CTableHeaderCell>
                      <CTableHeaderCell style={headerStyle} className="text-center">
                        Actions
                      </CTableHeaderCell>
                    </CTableRow>
                  </CTableHead>
                  <CTableBody>
                    {loading && (
                      <CTableRow>
                        <CTableDataCell colSpan="8" className="text-center py-4">
                          <CSpinner size="sm" />
                        </CTableDataCell>
                      </CTableRow>
                    )}
                    {!loading && categories.length > 0 ? (
                      categories.map((item) => (
                        <CategoryRow
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
                          <CTableDataCell colSpan="8" className="text-center py-4">
                            No categories found.
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

      {/*Edit Category Modal*/}
      <CModal size="lg" visible={showEditModal} onClose={handleCloseModals}>
        <CModalHeader>
          <CModalTitle>Edit Category</CModalTitle>
        </CModalHeader>
        <CModalBody>
          {selectedCategory && (
            <EditCategoryForm
              categoryToEdit={selectedCategory}
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

export default Categories