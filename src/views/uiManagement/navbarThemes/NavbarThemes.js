import React, { useState, useEffect } from 'react'
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
} from '@coreui/react'

const NavbarThemes = () => {
  const [themes, setThemes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isChangingTheme, setIsChangingTheme] = useState(false)

  // fetch all available themes 
  useEffect(() => {
    const fetchThemes = async () => {
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
    }

    fetchThemes()
  }, []) // Empty dependency array ensures this runs once on mount

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
      setError(
        error.response?.data?.message || 'An error occurred while activating the theme.',
      )
      setIsChangingTheme(false)
    }
  }

  const themeLoading = () => (
    <div className="text-center py-5">
      <CSpinner color="primary" />
      <p className="text-medium-emphasis mt-2" style={{ fontSize: '14px' }}>
        Loading Themes...</p>
    </div>
  )

  const themeTable = () => (
    <CTable align="middle" className="mb-0 border" hover responsive>
      <CTableHead>
        <CTableRow><CTableHeaderCell className="fw-semibold">Theme Name</CTableHeaderCell>
          <CTableHeaderCell className="fw-semibold">Description</CTableHeaderCell>
          <CTableHeaderCell className="fw-semibold" >
            Activate
          </CTableHeaderCell>
        </CTableRow>
      </CTableHead>
      <CTableBody>
        {themes.map((theme) => (
          <CTableRow key={theme.id}>
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
                title={
                  theme.is_active
                    ? 'This theme is already active'
                    : `Activate ${theme.name}`
                }
              />
            </CTableDataCell>
          </CTableRow>
        ))}
      </CTableBody>
    </CTable>
  )

  return (
    <CRow>
      <CCol xs={12}>
        <CCard className="mb-4">
          <CCardHeader>
            <h4 className="mb-0 fw-semibold" style={{ fontSize: '18px', letterSpacing: '-0.02em' }}>
              Navbar Themes
            </h4>
          </CCardHeader>
          <CCardBody>
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