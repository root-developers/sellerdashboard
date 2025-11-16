import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import axios from 'axios'
import {
  CButton,
  CCard,
  CCardBody,
  CCardGroup,
  CCol,
  CContainer,
  CForm,
  CFormInput,
  CInputGroup,
  CInputGroupText,
  CRow,
  CAlert,
  CSpinner,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilLockLocked, cilUser } from '@coreui/icons'
import Config from '../../../config/Config'
import { Save_User } from '../../../Redux/actions'

const Login = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  // Email validation
  const validateEmail = (email) => {
    const emailFormat = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailFormat.test(email)
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    // Clear error when user starts typing
    if (error) {
      setError('')
    }
  }

  const handleLogin = async (e) => {
    e.preventDefault()
    setError('')

    // Validation
    if (!formData.email.trim()) {
      setError('Please enter your email address')
      return
    }

    if (!validateEmail(formData.email)) {
      setError('Please enter a valid email address')
      return
    }

    if (!formData.password) {
      setError('Please enter your password')
      return
    }

    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters')
      return
    }

    setIsLoading(true)

    try {
      // API call to login
      const response = await axios.post(`${Config.baseUrl}/auth/login`, {
        email: formData.email.trim(),
        password: formData.password
      })

      if (response.data && response.data.success) {
        const userData = {
          ...response.data.data.user,
          token: response.data.data.token
        }

        // Check if the user is a seller or admin
        if (userData.role !== Config.userType.SELLER && userData.role !== Config.userType.ADMIN) {
          setError('Access denied. This portal is for sellers and the admin only.')
          setIsLoading(false)
          return
        }

        // Save user data to Redux store
        dispatch(Save_User(userData))

        // Navigate to dashboard
        navigate('/dashboard')
      } else {
        setError(response.data?.message || 'Login failed. Please check your credentials.')
      }
    } catch (error) {
      console.error('Login failed:', error)
      setError(
        error.response?.data?.message || 
        'Login failed. Please check your credentials and try again.'
      )
    } finally {
      setIsLoading(false)
    }
  }

  const isFormValid = 
    formData.email.trim() &&
    formData.password &&
    validateEmail(formData.email) &&
    formData.password.length >= 8

  return (
    <div className="bg-body-tertiary min-vh-100 d-flex flex-row align-items-center">
      <CContainer>
        <CRow className="justify-content-center">
          <CCol md={8}>
            <CCardGroup>
              <CCard className="p-4">
                <CCardBody>
                  <CForm onSubmit={handleLogin}>
                    <h1>Login</h1>
                    <p className="text-body-secondary">Sign in to your account</p>
                    
                    {error && (
                      <CAlert color="danger" dismissible onClose={() => setError('')}>
                        {error}
                      </CAlert>
                    )}

                    <CInputGroup className="mb-3">
                      <CInputGroupText>
                        <CIcon icon={cilUser} />
                      </CInputGroupText>
                      <CFormInput 
                        type="email"
                        name="email"
                        placeholder="Email Address" 
                        autoComplete="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        disabled={isLoading}
                        required
                      />
                    </CInputGroup>
                    <CInputGroup className="mb-4">
                      <CInputGroupText>
                        <CIcon icon={cilLockLocked} />
                      </CInputGroupText>
                      <CFormInput
                        type="password"
                        name="password"
                        placeholder="Password"
                        autoComplete="current-password"
                        value={formData.password}
                        onChange={handleInputChange}
                        disabled={isLoading}
                        required
                      />
                    </CInputGroup>
          
                    <CRow>
                      <CCol xs={6}>
                        <CButton 
                          color="primary" 
                          className="px-4"
                          type="submit"
                          disabled={isLoading || !isFormValid}
                        >
                          {isLoading ? (
                            <>
                              <CSpinner size="sm" className="me-2" />
                              Logging in...
                            </>
                          ) : (
                            'Login'
                          )}
                        </CButton>
                      </CCol>
                      <CCol xs={6} className="text-end">
                        <CButton 
                          color="link" 
                          className="px-0"
                          disabled={isLoading}
                        >
                          Forgot password?
                        </CButton>
                      </CCol>
                    </CRow>
                  </CForm>
                </CCardBody>
              </CCard>
              <CCard className="text-white bg-primary py-5" style={{ width: '44%' }}>
                <CCardBody className="text-center">
                  <div>
                    <h2>Sign up</h2>
                    <p>
                      Welcome to the seller dashboard. Manage your products, orders, and 
                      grow your business with our powerful tools.
                    </p>
                    <Link to="/register">
                      <CButton color="primary" className="mt-3" active tabIndex={-1}>
                        Register Now!
                      </CButton>
                    </Link>
                  </div>
                </CCardBody>
              </CCard>
            </CCardGroup>
          </CCol>
        </CRow>
      </CContainer>
    </div>
  )
}

export default Login
