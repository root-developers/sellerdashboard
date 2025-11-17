import React, { useState, useEffect, useCallback } from 'react'
import axios from 'axios'
import Config from '../../../config/Config'
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
  CFormSwitch,
  CSpinner,
  CAlert,
  CButton,
  CCollapse,
  CImage,
  CDropdown,
  CDropdownToggle,
  CDropdownItem,
  CDropdownMenu,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilOptions, cilPencil, cilPlus, cilTrash, cilX } from '@coreui/icons'
import AddNavbarTheme from '../../../components/navbarThemes/AddNavbarTheme'
import EditNavbarTheme from '../../../components/navbarThemes/EditNavbarTheme'
import { useSelector } from 'react-redux'
// import { toast } from 'react-toastify'

const NavbarThemes = () => {
  const user = useSelector((state) => state.UserReducer.user)
  const [themes, setThemes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isChangingTheme, setIsChangingTheme] = useState(false)
  const [showAddForm, setShowAddForm] = useState(false)
  const [refreshTrigger, setRefreshTrigger] = useState(0)
  const [isDeleting, setIsDeleting] = useState(false)

  // Handle refresh
  const handleRefresh = () => {
    setRefreshTrigger((prev) => prev + 1)
  }

  const handleDelete = async (theme) => {
    if (!window.confirm(`Are you sure you want to delete "${theme.name || 'this theme'}"?`)) return
    setIsDeleting(true)
    try {
      await axios.delete(`${Config.baseUrl}/themes/${theme.id}`, {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      })
      // toast.success('Theme deleted successfully')
      handleRefresh()
    } catch (error) {
      console.error(error.response?.data?.message || 'Failed to delete theme')
    } finally {
      setIsDeleting(false)
    }
  }

  // fetch all available themes
  const fetchThemes = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await axios.get(`${Config.baseUrl}/themes`, Config.AxiosConfig())

      if (response.data && response.data.success) {
        setThemes(response.data.data)
      } else {
        setError(response.data?.message || 'Failed to fetch themes.')
      }
    } catch (error) {
      console.error('Error fetching themes:', error)
      setError(
        error.response?.data?.message || 'An error occurred while fetching themes. Please try again.',
      )
    } finally {
      setLoading(false)
    }
  }, []) // Empty dependency array

  useEffect(() => {
    fetchThemes()
  }, [refreshTrigger, fetchThemes])

  // Handle theme change and page reload
  const handleThemeChange = async (themeId) => {
    setIsChangingTheme(true)
    setError(null)
    try {
      // API call to activate the new theme
      const response = await axios.put(
        `${Config.baseUrl}/themes/activateTheme/${themeId}`,
        {}, // Empty body for PUT request
        Config.AxiosConfig(),
      )

      if (response.data && response.data.success) {
        // Reload the page to apply the new theme
        window.location.reload()
      } else {
        setError(response.data?.message || 'Failed to activate theme.')
        setIsChangingTheme(false)
      }
    } catch (error) {
      console.error('Error activating theme:', error)
      setError(error.response?.data?.message || 'An error occurred while activating the theme.')
      setIsChangingTheme(false)
    }
  }

  const themeLoading = () => (
    <div className="text-center py-5">
      <CSpinner color="primary" />
      <p className="text-medium-emphasis mt-2" style={{ fontSize: '14px' }}>
        Loading Themes...
      </p>
    </div>
  )

  const themeTable = () => (
    <CTable align="middle" className="mb-0 border" hover responsive>
      <CTableHead>
        <CTableRow>
          <CTableHeaderCell className="fw-semibold">ID</CTableHeaderCell>
          <CTableHeaderCell className="fw-semibold text-center">Image</CTableHeaderCell>
          <CTableHeaderCell className="fw-semibold">Theme Name</CTableHeaderCell>
          <CTableHeaderCell className="fw-semibold">Description</CTableHeaderCell>
          <CTableHeaderCell className="fw-semibold">Activate</CTableHeaderCell>
          <CTableHeaderCell className="fw-semibold">Actions</CTableHeaderCell>
        </CTableRow>
      </CTableHead>
      <CTableBody>
        {themes.map((theme) => (
          <CTableRow key={theme.id}>
            <CTableDataCell>{theme.id}</CTableDataCell>
            <CTableDataCell className="text-center">
              {theme.image_url ? (
                <CImage
                  src={theme.image_url}
                  alt={theme.name}
                  style={{ width: '100px', height: '50px', objectFit: 'contain', borderRadius: '4px' }}
                />
              ) : (
                'No Image'
              )}
            </CTableDataCell>
            <CTableDataCell>
              <div>{theme.name}</div>
            </CTableDataCell>
            <CTableDataCell>
              <div className="text-body-secondary small">{theme.description}</div>
            </CTableDataCell>
            <CTableDataCell className="text-center">
              <CFormSwitch
                className="text-[#053264]"
                // color="primary"
                id={`theme-switch-${theme.id}`}
                checked={theme.is_active || false}
                disabled={isChangingTheme} // Disable while changing theme
                onChange={() => handleThemeChange(theme.id)}
                title={theme.is_active ? 'This theme is already active' : `Activate ${theme.name}`}
              />
            </CTableDataCell>
            <CTableDataCell className="text-center">
              <CDropdown alignment="end">
                <CDropdownToggle color="ghost" size="sm" caret={false} disabled={isDeleting}>
                  {isDeleting ? <CSpinner size="sm" /> : <CIcon icon={cilOptions} />}
                </CDropdownToggle>
                <CDropdownMenu>
                  {/* <CDropdownItem onClick={() => onEdit(item)} style={textStyle}>
                    <CIcon icon={cilPencil} className="me-2" />
                    Edit
                  </CDropdownItem> */}
                  <CDropdownItem
                    onClick={() => handleDelete(theme)}
                    disabled={isDeleting}
                    className="text-danger"
                  >
                    <CIcon icon={cilTrash} className="me-2" />
                    {isDeleting ? 'Deleting...' : 'Delete'}
                  </CDropdownItem>
                </CDropdownMenu>
              </CDropdown>
            </CTableDataCell>
          </CTableRow>
        ))}
      </CTableBody>
    </CTable>
  )

  return (
    <CRow>
      {/* Add New Theme */}
      <CCol xs={12}>
        <CCard className="mb-4">
          <CCardHeader className="d-flex justify-content-between align-items-center">
            <h5 className="mb-0 fw-semibold" style={{ fontSize: '18px' }}>
              Theme Management
            </h5>
            <CButton
              color={showAddForm ? 'secondary' : 'success'}
              onClick={() => setShowAddForm(!showAddForm)}
              className="d-flex align-items-center"
              style={{ fontSize: '14px', fontWeight: '500' }}
            >
              <CIcon icon={showAddForm ? cilX : cilPlus} className="me-2" />
              {showAddForm ? 'Close Form' : 'Add New Theme'}
            </CButton>
          </CCardHeader>
          <CCollapse visible={showAddForm}>
            <CCardBody className="border-top">
              <AddNavbarTheme
                onAdded={() => {
                  setShowAddForm(false)
                  handleRefresh()
                }}
                onCancel={() => setShowAddForm(false)}
              />
            </CCardBody>
          </CCollapse>
        </CCard>
      </CCol>

      {/* All themes */}
      <CCol xs={12}>
        <CCard className="mb-4">
          <CCardHeader>
            <h4 className="mb-0 fw-semibold" style={{ fontSize: '18px', letterSpacing: '-0.02em' }}>
              All Navbar Themes ({themes.length})
            </h4>
          </CCardHeader>
          <CCardBody>
            {error && <CAlert color="danger">{error}</CAlert>}
            {loading ? (
              themeLoading()
            ) : themes.length > 0 ? (
              themeTable()
            ) : (
              <p>No themes found.</p>
            )}
          </CCardBody>
        </CCard>
      </CCol>
    </CRow>
  )
}

export default NavbarThemes