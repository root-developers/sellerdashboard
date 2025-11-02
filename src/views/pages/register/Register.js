import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import axios from 'axios'
import {
  CButton,
  CCard,
  CCardBody,
  CCol,
  CContainer,
  CForm,
  CFormInput,
  CInputGroup,
  CInputGroupText,
  CRow,
  CAlert,
  CSpinner,
  CFormCheck,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilLockLocked, cilUser, cilEnvelopeOpen, cilPhone, cilBuilding } from '@coreui/icons'
import Config from '../../../config/Config'
import { Save_User } from '../../../Redux/actions'

// Validation patterns
const emailFormat = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const passwordFormat = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/
const phoneFormat = /^(\+91)?[6-9]\d{9}$/

const Register = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const user = useSelector((state) => state.UserReducer?.user)

  // Redirect if already logged in
  useEffect(() => {
    if (user && user.token) {
      navigate('/dashboard')
    }
  }, [user, navigate])

  const [formData, setFormData] = useState({
    firstName: '',
    email: '',
    password: '',
    phone: '',
    companyName: '',
  })
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState({})
  const [showPassword, setShowPassword] = useState(false)
  const [agreeToTerms, setAgreeToTerms] = useState(false)
  const [passwordStrength, setPasswordStrength] = useState(0)

  // Calculate password strength
  useEffect(() => {
    if (formData.password) {
      let strength = 0
      if (formData.password.length >= 8) strength += 1
      if (/[a-z]/.test(formData.password)) strength += 1
      if (/[A-Z]/.test(formData.password)) strength += 1
      if (/\d/.test(formData.password)) strength += 1
      if (/[@$!%*?&]/.test(formData.password)) strength += 1
      setPasswordStrength(strength)
    } else {
      setPasswordStrength(0)
    }
  }, [formData.password])

  const validateField = (name, value) => {
    if (value === undefined || value === null) {
      value = ''
    }

    value = String(value)

    switch (name) {
      case 'firstName':
        if (!value.trim()) return 'Please enter your name'
        if (value.trim().length < 3) return 'Name must be at least 3 characters'
        if (value.trim().length > 50) return 'Name must be less than 50 characters'
        if (!/^[a-zA-Z\s]+$/.test(value.trim())) return 'Name can only contain letters and spaces'
        return ''

      case 'email':
        if (!value.trim()) return 'Please enter your email address'
        if (!emailFormat.test(value)) return 'Please enter a valid email address'
        return ''

      case 'password':
        if (!value) return 'Please enter a password'
        if (value.length < 8) return 'Password must be at least 8 characters'
        if (!passwordFormat.test(value)) {
          return 'Password must contain uppercase, lowercase, number, and special character'
        }
        return ''

      case 'phone':
        if (!value.trim()) return 'Please enter your phone number'
        if (!phoneFormat.test(value.trim())) return 'Please enter a valid Indian phone number'
        return ''

      case 'companyName':
        if (!value.trim()) return 'Company name is required for sellers'
        if (value.trim().length < 3) return 'Company name must be at least 3 characters'
        return ''

      default:
        return ''
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))

    // Clear general error when user starts typing
    if (errors.general) {
      setErrors((prev) => ({
        ...prev,
        general: '',
      }))
    }

    const error = validateField(name, value)
    setErrors((prev) => ({
      ...prev,
      [name]: error,
    }))
  }

  const validateForm = () => {
    const newErrors = {}

    const requiredFields = ['firstName', 'email', 'phone', 'password', 'companyName']
    requiredFields.forEach((key) => {
      const error = validateField(key, formData[key])
      if (error) newErrors[key] = error
    })

    if (!agreeToTerms) {
      newErrors.terms = 'Please agree to the Terms of Service and Privacy Policy'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleRegister = async (e) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setIsLoading(true)

    try {
      // API call to register new seller
      const response = await axios.post(`${Config.apiUrl}/auth/register`, {
        first_name: formData.firstName.trim(),
        email: formData.email.trim(),
        password: formData.password,
        phone: formData.phone.trim(),
        role: Config.userType.SELLER, // Always register as seller in this dashboard
        company_name: formData.companyName.trim(),
      })

      if (response.data && response.data.success) {
        // Save user data to Redux store
        const userData = {
          ...response.data.data.user,
          token: response.data.data.token,
        }

        dispatch(Save_User(userData))

        // Navigate to dashboard
        navigate('/dashboard')
      } else {
        setErrors({ general: response.data?.message || 'Registration failed. Please try again.' })
      }
    } catch (error) {
      console.error('Registration failed:', error)
      setErrors({
        general: error.response?.data?.message || 'Registration failed. Please try again.',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const getPasswordStrengthColor = () => {
    if (passwordStrength < 2) return 'danger'
    if (passwordStrength < 4) return 'warning'
    return 'success'
  }

  const getPasswordStrengthText = () => {
    if (passwordStrength < 2) return 'Weak'
    if (passwordStrength < 4) return 'Medium'
    return 'Strong'
  }

  const isFormValid =
    formData.firstName.trim() &&
    formData.email.trim() &&
    formData.password &&
    formData.phone.trim() &&
    formData.companyName.trim() &&
    emailFormat.test(formData.email) &&
    passwordFormat.test(formData.password) &&
    agreeToTerms &&
    Object.keys(errors).filter((key) => key !== 'general').every((key) => !errors[key])

  return (
    <div className="bg-body-tertiary min-vh-100 d-flex flex-row align-items-center">
      <CContainer>
        <CRow className="justify-content-center">
          <CCol md={9} lg={7} xl={6}>
            <CCard className="mx-4">
              <CCardBody className="p-4">
                <CForm onSubmit={handleRegister}>
                  <h1>Register</h1>
                  <p className="text-body-secondary">Create your seller account</p>

                  {errors.general && (
                    <CAlert color="danger" dismissible onClose={() => setErrors({ ...errors, general: '' })}>
                      {errors.general}
                    </CAlert>
                  )}

                  <CInputGroup className="mb-3">
                    <CInputGroupText>
                      <CIcon icon={cilUser} />
                    </CInputGroupText>
                    <CFormInput
                      type="text"
                      name="firstName"
                      placeholder="Full Name"
                      autoComplete="name"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      disabled={isLoading}
                      invalid={!!errors.firstName}
                      required
                    />
                  </CInputGroup>
                  {errors.firstName && <div className="text-danger small mb-3">{errors.firstName}</div>}

                  <CInputGroup className="mb-3">
                    <CInputGroupText>
                      <CIcon icon={cilEnvelopeOpen} />
                    </CInputGroupText>
                    <CFormInput
                      type="email"
                      name="email"
                      placeholder="Email Address"
                      autoComplete="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      disabled={isLoading}
                      invalid={!!errors.email}
                      required
                    />
                  </CInputGroup>
                  {errors.email && <div className="text-danger small mb-3">{errors.email}</div>}

                  <CInputGroup className="mb-3">
                    <CInputGroupText>
                      <CIcon icon={cilPhone} />
                    </CInputGroupText>
                    <CFormInput
                      type="tel"
                      name="phone"
                      placeholder="Phone Number"
                      autoComplete="tel"
                      value={formData.phone}
                      onChange={handleInputChange}
                      disabled={isLoading}
                      invalid={!!errors.phone}
                      required
                    />
                  </CInputGroup>
                  {errors.phone && <div className="text-danger small mb-3">{errors.phone}</div>}

                  <CInputGroup className="mb-3">
                    <CInputGroupText>
                      <CIcon icon={cilBuilding} />
                    </CInputGroupText>
                    <CFormInput
                      type="text"
                      name="companyName"
                      placeholder="Company Name"
                      autoComplete="organization"
                      value={formData.companyName}
                      onChange={handleInputChange}
                      disabled={isLoading}
                      invalid={!!errors.companyName}
                      required
                    />
                  </CInputGroup>
                  {errors.companyName && <div className="text-danger small mb-3">{errors.companyName}</div>}

                  <CInputGroup className="mb-3">
                    <CInputGroupText>
                      <CIcon icon={cilLockLocked} />
                    </CInputGroupText>
                    <CFormInput
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      placeholder="Password"
                      autoComplete="new-password"
                      value={formData.password}
                      onChange={handleInputChange}
                      disabled={isLoading}
                      invalid={!!errors.password}
                      required
                    />
                    <CInputGroupText
                      style={{ cursor: 'pointer' }}
                      onClick={() => setShowPassword(!showPassword)}
                    >
                    </CInputGroupText>
                  </CInputGroup>
                  {errors.password && <div className="text-danger small mb-3">{errors.password}</div>}
                  {formData.password && (
                    <div className="mb-4">
                      <small className="text-body-secondary">
                        Password Strength: <span className={`text-${getPasswordStrengthColor()}`}>{getPasswordStrengthText()}</span>
                      </small>
                    </div>
                  )}

                  <div className="mb-3">
                    <CFormCheck
                      id="agreeToTerms"
                      label={
                        <span>
                          I agree to the{' '}
                          <a href="#" className="text-primary">
                            Terms of Service
                          </a>{' '}
                          and{' '}
                          <a href="#" className="text-primary">
                            Privacy Policy
                          </a>
                        </span>
                      }
                      checked={agreeToTerms}
                      onChange={(e) => {
                        setAgreeToTerms(e.target.checked)
                        if (errors.terms) {
                          setErrors({ ...errors, terms: '' })
                        }
                      }}
                      disabled={isLoading}
                      invalid={!!errors.terms}
                    />
                    {errors.terms && <div className="text-danger small mt-1">{errors.terms}</div>}
                  </div>

                  <div className="d-grid">
                    <CButton color="success" type="submit" disabled={isLoading || !isFormValid}>
                      {isLoading ? (
                        <>
                          <CSpinner size="sm" className="me-2" />
                          Creating Account...
                        </>
                      ) : (
                        'Create Seller Account'
                      )}
                    </CButton>
                  </div>

                  <div className="text-center mt-3">
                    <span className="text-body-secondary">Already have an account? </span>
                    <Link to="/login" className="text-primary">
                      Login
                    </Link>
                  </div>
                </CForm>
              </CCardBody>
            </CCard>
          </CCol>
        </CRow>
      </CContainer>
    </div>
  )
}

export default Register
