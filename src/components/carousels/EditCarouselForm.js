import React, { useState, useEffect } from 'react'
import { toast } from 'react-toastify'
import {
  CForm,
  CFormInput,
  CFormLabel,
  CButton,
  CRow,
  CCol,
  CSpinner,
  CImage,
  CFormSwitch,
} from '@coreui/react'
import { useSelector } from 'react-redux'
import Config from '../../config/Config'

const EditCarouselForm = ({ carouselToEdit, onUpdated, onCancel }) => {
  const user = useSelector((state) => state.UserReducer.user)

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    link_url: '',
    display_order: 0,
    is_active: false,
  })
  const [imageFile, setImageFile] = useState(null)
  const [currentImageUrl, setCurrentImageUrl] = useState(null)
  const [errors, setErrors] = useState({})
  const [touched, setTouched] = useState({})
  const [formError, setFormError] = useState('')
  const [imageError, setImageError] = useState('')

  useEffect(() => {
    if (carouselToEdit) {
      setFormData({
        title: carouselToEdit.title || '',
        link_url: carouselToEdit.link_url || '',
        display_order: carouselToEdit.display_order || 0,
        is_active: carouselToEdit.is_active || false,
      })
      setCurrentImageUrl(carouselToEdit.image_url || null)
      // Clear all validation states
      setErrors({})
      setTouched({})
      setFormError('')
      setImageError('')
      setImageFile(null)
    }
  }, [carouselToEdit])

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
        if (value.trim() && !/^https?:\/\/.+/.test(value.trim()))
          error = 'Must be a valid URL (e.g., http://example.com)'
        break
      case 'display_order':
        if (value && (isNaN(value) || parseInt(value, 10) < 0))
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
      setCurrentImageUrl(URL.createObjectURL(file)) // Show preview of new image
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
    return true
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setFormError('')
    setImageError('')

    if (!carouselToEdit || !carouselToEdit.id) {
      setFormError('No slide selected for editing.')
      return
    }

    // validate all fields
    const newErrors = {}
    const fieldsToValidate = ['title', 'link_url', 'display_order', 'is_active']
    fieldsToValidate.forEach((field) => {
      const error = validateField(field, formData[field])
      if (error) newErrors[field] = error
    })
    setErrors(newErrors)
    setTouched({ title: true, link_url: true, display_order: true, is_active: true })

    if (Object.keys(newErrors).length > 0) {
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
      if (imageFile) {
        submitData.append('carousel_image', imageFile)
      }

      // const response = await fetch(`${Config.baseUrl}/carousels/${carouselToEdit.id}`, {
      const response = await fetch(`${Config.baseUrl}/carousels/`, {
        method: 'POST',
        headers: {
          'authorization': user.token,
          'id': user.userId || user.id,
         },
        body: submitData,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to update carousel slide.')
      }

      toast.success('Carousel slide updated successfully!')
      onUpdated()
    } catch (error) {
      console.error('Error updating slide:', error)
      setFormError(`${error.message}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <CForm onSubmit={handleSubmit}>
      <CRow className="mb-3">
        <CCol md={8}>
          <CFormLabel htmlFor="edit-title">
            Title <span className="text-danger">*</span>
          </CFormLabel>
          <CFormInput
            type="text"
            id="edit-title"
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
          <CFormLabel htmlFor="edit-display_order">Display Order</CFormLabel>
          <CFormInput
            type="number"
            id="edit-display_order"
            name="display_order"
            value={formData.display_order}
            onChange={handleInputChange}
            onBlur={handleBlur}
            min="0"
            invalid={touched.display_order && !!errors.display_order}
          />
          {touched.display_order && errors.display_order && (
            <div className="invalid-feedback d-block">{errors.display_order}</div>
          )}
        </CCol>
      </CRow>

      <CRow className="mb-3">
        <CCol md={12}>
          <CFormLabel htmlFor="edit-link_url">Link URL</CFormLabel>
          <CFormInput
            type="text"
            id="edit-link_url"
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
        <CCol md={6}>
          <CFormLabel htmlFor="edit-image">New Slide Image</CFormLabel>
          <CFormInput
            type="file"
            id="edit-image"
            accept="image/jpeg,image/jpg,image/png,image/webp"
            onChange={handleImageChange}
          />
          {imageError && <div className="text-danger small mt-1">{imageError}</div>}
          <small className="text-muted d-block mt-1">
            Upload a new file if you want to replace the current one.
          </small>
        </CCol>
        <CCol md={3} className="d-flex align-items-center pt-3">
          <CFormSwitch
            label="Active"
            id="is_active"
            name="is_active"
            checked={formData.is_active}
            onChange={handleInputChange}
          />
        </CCol>
        <CCol md={3}>
          <CFormLabel>Current Image</CFormLabel>
          <div>
            <CImage
              src={currentImageUrl}
              alt="Current slide"
              style={{ width: '100px', height: '50px', objectFit: 'contain', borderRadius: '4px' }}
            />
          </div>
        </CCol>
      </CRow>

      <div className="d-flex gap-2 justify-content-end mt-4">
        {formError && <div className="text-danger small me-auto">{formError}</div>}
        <CButton color="secondary" onClick={onCancel} disabled={isSubmitting}>
          Cancel
        </CButton>
        <CButton color="success" type="submit" disabled={isSubmitting || !isFormValid()}>
          {isSubmitting ? (
            <>
              <CSpinner size="sm" className="me-2" />
              Saving...
            </>
          ) : (
            'Save Changes'
          )}
        </CButton>
      </div>
    </CForm>
  )
}

export default EditCarouselForm