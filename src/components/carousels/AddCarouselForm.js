import React, { useState } from 'react'
import { toast } from 'react-toastify'
import {
  CForm,
  CFormInput,
  CFormLabel,
  CButton,
  CRow,
  CCol,
  CSpinner,
  CFormSwitch,
} from '@coreui/react'
import { useSelector } from 'react-redux'
import Config from '../../config/Config'

const AddCarouselForm = ({ onAdded, onCancel }) => {
  const user = useSelector((state) => state.UserReducer.user)

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    link_url: '',
    display_order: 0,
    is_active: true, // default
  })
  const [imageFile, setImageFile] = useState(null)
  const [errors, setErrors] = useState({})
  const [touched, setTouched] = useState({})
  const [formError, setFormError] = useState('') // For general form errors
  const [imageError, setImageError] = useState('') // For image-specific errors

  // Validation function
  const validateField = (name, value) => {
    let error = ''
    switch (name) {
      case 'title':
        if (!value.trim()) error = 'Title is required'
        else if (value.trim().length < 3) error = 'Title must be at least 3 characters'
        else if (value.trim().length > 100) error = 'Title must not exceed 100 characters'
        break
      case 'link_url':
        if (value.trim() && !/^https?:\/\/.+/.test(value.trim())) // validate if not empty
          error = 'Must be a valid URL (e.g., http://example.com)'
        break
      case 'display_order':
        if (value && (isNaN(value) || parseInt(value, 10) < 0)) // validate if not empty
          error = 'Display order must be 0 or greater'
        break
      case 'is_active': 
        if (typeof value !== 'boolean') error = 'Active status must be true or false'
        break
      default:
        break
    }
    return error
  }

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target 
    const val = type === 'checkbox' ? checked : value 

    setFormData((prev) => ({
      ...prev,
      [name]: val,
    }))
    if (touched[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: validateField(name, val),
      }))
    }
  }

  const handleBlur = (e) => {
    const { name, value } = e.target
    setTouched((prev) => ({ ...prev, [name]: true }))
    setErrors((prev) => ({
      ...prev,
      [name]: validateField(name, value),
    }))
  }

  const handleImageChange = (e) => {
    setImageError('')
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
      if (!validTypes.includes(file.type)) {
        setImageError('Invalid file type. Please use JPEG, PNG, or WebP.')
        e.target.value = ''
        return
      }
      const maxSize = 5 * 1024 * 1024 // 5MB
      if (file.size > maxSize) {
        setImageError('Image size must not exceed 5MB')
        e.target.value = ''
        return
      }
      setImageFile(file)
    }
  }

  const isFormValid = () => {
    const requiredFields = ['title', 'is_active']
    for (const field of requiredFields) {
      if (formData[field] === null || formData[field] === undefined) return false
      if (field !== 'is_active' && formData[field].toString().trim() === '') return false
      if (validateField(field, formData[field])) return false
    }
    if (imageError) return false
    // Image is required
    if (!imageFile) {
      setImageError('A carousel image is required.')
      return false
    }
    return true
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setFormError('')
    setImageError('')

    // validate all fields
    const newErrors = {}
    const fieldsToValidate = ['title', 'link_url', 'display_order', 'is_active']
    fieldsToValidate.forEach((field) => {
      const error = validateField(field, formData[field])
      if (error) newErrors[field] = error
    })
    setErrors(newErrors)
    setTouched({ title: true, link_url: true, display_order: true, is_active: true })

    if (!imageFile) {
      setImageError('A carousel image is required.')
    }

    if (Object.keys(newErrors).length > 0 || !imageFile) {
      setFormError('Please review the form. Some fields have errors.')
      return
    }

    if (!isFormValid()) {
      setFormError('Please fill in all required fields correctly.')
      return
    }

    setIsSubmitting(true)

    try {
      const submitData = new FormData()
      submitData.append('title', formData.title.trim())
      submitData.append('link_url', formData.link_url.trim())
      submitData.append('display_order', formData.display_order || 0)
      submitData.append('is_active', formData.is_active)
      submitData.append('carousel_image', imageFile)

      const response = await fetch(`${Config.baseUrl}/carousels`, {
        method: 'POST',
        headers: {
          'authorization': user.token,
          'id': user.userId || user.id,
        },
        body: submitData,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to create carousel slide.')
      }

      toast.success('Carousel slide created successfully!')
      onAdded()
    } catch (error) {
      console.error('Error creating slide:', error)
      setFormError(`An error occurred: ${error.message}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="border-top pt-4">
      <h5 className="mb-4">Add New Carousel Slide</h5>
      <CForm onSubmit={handleSubmit}>
        <CRow className="mb-3">
          <CCol md={8}>
            <CFormLabel htmlFor="title">
              Title <span className="text-danger">*</span>
            </CFormLabel>
            <CFormInput
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              onBlur={handleBlur}
              placeholder="e.g., Big Diwali Sale"
              invalid={touched.title && !!errors.title}
            />
            {touched.title && errors.title && (
              <div className="invalid-feedback d-block">{errors.title}</div>
            )}
          </CCol>
          <CCol md={4}>
            <CFormLabel htmlFor="display_order">Display Order</CFormLabel>
            <CFormInput
              type="number"
              id="display_order"
              name="display_order"
              value={formData.display_order}
              onChange={handleInputChange}
              onBlur={handleBlur}
              min="0"
              placeholder="0"
              invalid={touched.display_order && !!errors.display_order}
            />
            {touched.display_order && errors.display_order && (
              <div className="invalid-feedback d-block">{errors.display_order}</div>
            )}
          </CCol>
        </CRow>

        <CRow className="mb-3">
          <CCol md={12}>
            <CFormLabel htmlFor="link_url">Link URL</CFormLabel>
            <CFormInput
              type="text"
              id="link_url"
              name="link_url"
              value={formData.link_url}
              onChange={handleInputChange}
              onBlur={handleBlur}
              placeholder="e.g., https://example.com/products/sale"
              invalid={touched.link_url && !!errors.link_url}
            />
            {touched.link_url && errors.link_url && (
              <div className="invalid-feedback d-block">{errors.link_url}</div>
            )}
          </CCol>
        </CRow>

        <CRow className="mb-4">
          <CCol md={8}>
            <CFormLabel htmlFor="image">
              Slide Image <span className="text-danger">*</span>
            </CFormLabel>
            <CFormInput
              type="file"
              id="image"
              accept="image/jpeg,image/jpg,image/png,image/webp"
              onChange={handleImageChange}
            />
            {imageError && <div className="text-danger small mt-1">{imageError}</div>}
            <small className="text-muted d-block mt-1">
              Required. Accepted formats: JPEG, PNG, WebP (Max 5MB)
            </small>
          </CCol>
          <CCol md={4} className="d-flex align-items-center pt-3">
            <CFormSwitch
              label="Active"
              id="is_active"
              name="is_active"
              checked={formData.is_active}
              onChange={handleInputChange}
            />
          </CCol>
        </CRow>

        <div className="d-flex gap-2 justify-content-end">
          {formError && <div className="text-danger small me-auto">{formError}</div>}
          <CButton color="secondary" onClick={onCancel} disabled={isSubmitting}>
            Cancel
          </CButton>
          <CButton color="success" type="submit" disabled={isSubmitting || !isFormValid()}>
            {isSubmitting ? (
              <>
                <CSpinner size="sm" className="me-2" />
                Creating...
              </>
            ) : (
              'Create Slide'
            )}
          </CButton>
        </div>
      </CForm>
    </div>
  )
}

export default AddCarouselForm