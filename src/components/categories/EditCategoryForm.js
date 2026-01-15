import React, { useState, useEffect } from 'react'
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
  CImage,
  CFormSwitch,
} from '@coreui/react'
import { useSelector } from 'react-redux'
import Config from '../../config/Config'

const EditCategoryForm = ({ categoryToEdit, onUpdated, onCancel }) => {
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
  const [currentImage, setCurrentImage] = useState(null)
  const [errors, setErrors] = useState({})
  const [touched, setTouched] = useState({})
  const [formError, setFormError] = useState('')
  const [imageError, setImageError] = useState('')

  useEffect(() => {
    if (categoryToEdit) {
      setFormData({
        name: categoryToEdit.name || '',
        description: categoryToEdit.description || '',
        slug: categoryToEdit.slug || '',
        is_active: categoryToEdit.is_active || false,
        sort_order: categoryToEdit.sort_order || 0,
      })
      setCurrentImage(categoryToEdit.image || null)
      // Clear all validation states
      setErrors({})
      setTouched({})
      setFormError('')
      setImageError('')
      setImageFile(null)
    }
  }, [categoryToEdit])

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
        else if (!/^[a-z0-9-]+$/.test(value.trim()))
          error = 'Slug must be lowercase with no spaces (e.g., my-category)'
        break
      case 'is_active':
        if (typeof value !== 'boolean') error = 'Active status must be true or false'
        break
      case 'sort_order':
        if (value === '' || value === null) error = 'Sort order is required'
        else if (isNaN(value) || Number(value) < 0)
          error = 'Sort order must be a non-negative number'
        break
      case 'description':
        if (value === '' || value === null) error = 'Description is required'
        else if (value.trim() && value.trim().length > 500)
          error = 'Description must not exceed 500 characters'
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
      setCurrentImage(URL.createObjectURL(file)) // Show preview of new image
    }
  }

  // Updated isFormValid to make image compulsory
  const isFormValid = () => {
    const requiredFields = ['name', 'description', 'slug', 'is_active', 'sort_order']
    for (const field of requiredFields) {
      if (formData[field] === null || formData[field] === undefined) return false
      if (
        field !== 'is_active' &&
        field !== 'sort_order' &&
        formData[field].toString().trim() === ''
      )
        return false
      if (validateField(field, formData[field])) return false
    }
    if (imageError) return false // Check for upload errors

    if (!currentImage && !imageFile) {
      setImageError('A category image is required.')
      return false
    }

    return true
  }

  // Updated handleSubmit to always send FormData
  const handleSubmit = async (e) => {
    e.preventDefault()
    setFormError('')
    setImageError('')

    if (!categoryToEdit || !categoryToEdit.id) {
      setFormError('No category selected for editing.')
      return
    }

    // Run validation on all fields
    const newErrors = {}
    const fieldsToValidate = ['name', 'description', 'slug', 'is_active', 'sort_order']
    fieldsToValidate.forEach((field) => {
      const error = validateField(field, formData[field])
      if (error) newErrors[field] = error
    })
    setErrors(newErrors)
    setTouched({ name: true, description: true, slug: true, is_active: true, sort_order: true })

    if (Object.keys(newErrors).length > 0) {
      setFormError('Please review the form. Some fields have errors.')
      return
    }

    // Re-check image validity on submit
    if (!currentImage && !imageFile) {
      setImageError('A category image is required.')
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
      if (imageFile) {
        submitData.append('image', imageFile) // New image file
      } else {
        submitData.append('image', currentImage) // existing image
      }

      const response = await fetch(`${Config.baseUrl}/categories/${categoryToEdit.id}`, {
        method: 'PUT',
        headers: {
          authorization: user.token,
          id: user.userId || user.id,
        },
        body: submitData,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to update category.')
      }

      toast.success('Category updated successfully!')
      onUpdated()
    } catch (error) {
      console.error('Error updating category:', error)
      setFormError(`An error occurred: ${error.message}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <CForm onSubmit={handleSubmit}>
      <CRow className="mb-3">
        <CCol md={6}>
          <CFormLabel htmlFor="edit-name">
            Category Name <span className="text-danger">*</span>
          </CFormLabel>
          <CFormInput
            type="text"
            id="edit-name"
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
          <CFormLabel htmlFor="edit-slug">
            Slug <span className="text-danger">*</span>
          </CFormLabel>
          <CFormInput
            type="text"
            id="edit-slug"
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
          <CFormLabel htmlFor="edit-sort_order">
            Sort Order <span className="text-danger">*</span>
          </CFormLabel>
          <CFormInput
            type="number"
            id="edit-sort_order"
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
          <CFormLabel htmlFor="edit-description">
            Description <span className="text-danger">*</span>
          </CFormLabel>
          <CFormTextarea
            id="edit-description"
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
        <CCol md={6}>
          <CFormLabel htmlFor="edit-image">New Category Image</CFormLabel>
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
              src={currentImage}
              alt="Current category"
              style={{ width: '80px', height: '80px', objectFit: 'contain', borderRadius: '4px' }}
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

export default EditCategoryForm
