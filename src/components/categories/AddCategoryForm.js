import React, { useState } from 'react'
import { toast } from 'react-toastify'
import {
  CForm,
  CFormInput,
  CFormLabel,
  CFormTextarea,
  CButton,
  CRow,
  CCol,
  CSpinner,
  CFormSwitch,
} from '@coreui/react'
import { useSelector } from 'react-redux'
import Config from '../../config/Config'

const AddCategoryForm = ({ onAdded, onCancel }) => {
  const user = useSelector((state) => state.UserReducer.user)

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    slug: '',
    is_active: true,
    sort_order: 0,
  })
  const [imageFile, setImageFile] = useState(null)
  const [errors, setErrors] = useState({})
  const [touched, setTouched] = useState({})
  const [formError, setFormError] = useState('')
  const [imageError, setImageError] = useState('')

  // Validation function
  const validateField = (name, value) => {
    let error = ''
    switch (name) {
      case 'name':
        if (!value.trim()) error = 'Category name is required'
        else if (value.trim().length < 2) error = 'Name must be at least 2 characters'
        else if (value.trim().length > 100) error = 'Name must not exceed 100 characters'
        break
      case 'slug':
        if (!value.trim()) error = 'Slug is required'
        else if (!/^[a-z0-9-]+$/.test(value.trim())) error = 'Slug must be lowercase with no spaces (e.g., my-category)'
        break
      case 'description':
        if (value === '' || value === null) error = 'Description is required'
        else if (value.trim() && value.trim().length > 500)
          error = 'Description must not exceed 500 characters'
        break
        case 'sort_order':
        if (value === '' || value === null) error = 'Sort order is required'
        else if (isNaN(value) || Number(value) < 0) error = 'Sort order must be a non-negative number'
        break;
      case 'is_active':
        if (typeof value !== 'boolean') error = 'Axtive status must be true or false'
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
    const requiredFields = ['name', 'slug', 'is_active', 'description', 'sort_order']
    for (const field of requiredFields) {
      if (formData[field] === null || formData[field] === undefined) return false
      if (field !== 'is_active' && field !== 'sort_order' && formData[field].toString().trim() === '') return false // boolean is_active 
      if (validateField(field, formData[field])) return false
    }
    if (imageError) return false
    if (!imageFile) {
      setImageError('A category image is required.')
      return false
    }
    return true
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setFormError('')
    setImageError('')

    // Validate all fields
    const newErrors = {}
    const fieldsToValidate = ['name', 'description', 'slug', 'is_active', 'sort_order']
    fieldsToValidate.forEach((field) => {
      const error = validateField(field, formData[field])
      if (error) newErrors[field] = error
    })
    setErrors(newErrors)
    setTouched({ name: true, description: true, slug: true, is_active: true, sort_order: true })

    if (!imageFile) {
      setImageError('A category image is required.')
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
      submitData.append('name', formData.name.trim())
      submitData.append('description', formData.description.trim())
      submitData.append('slug', formData.slug.trim())
      submitData.append('is_active', formData.is_active)
      submitData.append('sort_order', formData.sort_order)
      submitData.append('image', imageFile)

      const response = await fetch(`${Config.baseUrl}/categories`, {
        method: 'POST',
        headers: {
          'authorization': user.token,
          'id': user.userId || user.id,
        },
        body: submitData,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to create category.')
      }

      toast.success('Category created successfully!')
      onAdded()
    } catch (error) {
      console.error('Error creating category:', error)
      setFormError(`${error.message}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="border-top pt-4">
      <h5 className="mb-4">Add New Category</h5>
      <CForm onSubmit={handleSubmit}>
        <CRow className="mb-3">
          <CCol md={6}>
            <CFormLabel htmlFor="name">
              Category Name <span className="text-danger">*</span>
            </CFormLabel>
            <CFormInput
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              onBlur={handleBlur}
              placeholder="e.g., Electronics"
              invalid={touched.name && !!errors.name}
            />
            {touched.name && errors.name && (
              <div className="invalid-feedback d-block">{errors.name}</div>
            )}
          </CCol>
          <CCol md={6}>
            <CFormLabel htmlFor="slug">
              Slug <span className="text-danger">*</span>
            </CFormLabel>
            <CFormInput
              type="text"
              id="slug"
              name="slug"
              value={formData.slug}
              onChange={handleInputChange}
              onBlur={handleBlur}
              placeholder="e.g., electronics"
              invalid={touched.slug && !!errors.slug}
            />
            {touched.slug && errors.slug && (
              <div className="invalid-feedback d-block">{errors.slug}</div>
            )}
          </CCol>
        </CRow>

        <CRow className="mb-3">
            <CCol md={12}>
            <CFormLabel htmlFor="sort_order">
                Sort Order <span className="text-danger">*</span>
            </CFormLabel>
            <CFormInput
                type="number"
                id="sort_order"
                name="sort_order"
                value={formData.sort_order}
                onChange={handleInputChange}
                onBlur={handleBlur}
                placeholder="0"
                min="0"
                invalid={touched.sort_order && !!errors.sort_order}
            />
            {touched.sort_order && errors.sort_order && (
                <div className="invalid-feedback d-block">{errors.sort_order}</div>
            )}
            </CCol>
        </CRow>

        <CRow className="mb-3">
          <CCol md={12}>
            <CFormLabel htmlFor="description">Description <span className="text-danger">*</span></CFormLabel>
            <CFormTextarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              onBlur={handleBlur}
              placeholder="A brief description of the category (max 500 chars)"
              rows="3"
              invalid={touched.description && !!errors.description}
            />
            {touched.description && errors.description && (
              <div className="invalid-feedback d-block">{errors.description}</div>
            )}
          </CCol>
        </CRow>

        <CRow className="mb-4">
          <CCol md={8}>
            <CFormLabel htmlFor="image">
              Category Image <span className="text-danger">*</span>
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

          <CCol md={3} className="d-flex align-items-center pt-3">
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
          <CButton color="success" type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <CSpinner size="sm" className="me-2" />
                Creating...
              </>
            ) : (
              'Create Category'
            )}
          </CButton>
        </div>
      </CForm>
    </div>
  )
}

export default AddCategoryForm