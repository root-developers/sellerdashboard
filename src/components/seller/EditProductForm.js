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
} from '@coreui/react'
import { useSelector } from 'react-redux'
import Config from '../../config/Config'

const EditProductForm = ({ productToEdit, onProductUpdated, onCancel }) => {
  const user = useSelector((state) => state.UserReducer.user)

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category_id: '',
    stock_quantity: '',
    brand: '',
    slug: '',
    sku: '',
  })
  // Note: Image editing is not included in this form.
  // A proper implementation would require handling image uploads, previews, and deletions.

  // When the productToEdit prop changes, update the form data
  useEffect(() => {
    if (productToEdit) {
      setFormData({
        name: productToEdit.name || '',
        description: productToEdit.description || '',
        price: productToEdit.price || '',
        category_id: productToEdit.category_id || '',
        stock_quantity: productToEdit.stock_quantity || '',
        brand: productToEdit.brand || '',
        slug: productToEdit.slug || '',
        sku: productToEdit.sku || '',
      })
    }
  }, [productToEdit])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!productToEdit || !productToEdit.id) {
      toast.error('No product selected for editing.')
      return
    }

    // Validation
    if (!formData.name || !formData.price || !formData.category_id) {
      toast.error('Please fill in all required fields')
      return
    }

    setIsSubmitting(true)

    try {
      // object for the JSON payload
      const updatePayload = {
        name: formData.name,
        description: formData.description,
        price: Number(formData.price),
        category_id: Number(formData.category_id),
        stock_quantity: Number(formData.stock_quantity),
        brand: formData.brand,
        slug: formData.slug,
        sku: formData.sku,
      }

      const response = await fetch(`${Config.baseUrl}/products/${productToEdit.id}`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${user.token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatePayload),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to update product')
      }

      // Call the success callback
      onProductUpdated()
    } catch (error) {
      console.error('Error updating product:', error)
      toast.error(`Failed to update product: ${error.message}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <CForm onSubmit={handleSubmit}>
      <CRow className="mb-3">
        <CCol md={6}>
          <CFormLabel htmlFor="edit-name">
            Product Name <span className="text-danger">*</span>
          </CFormLabel>
          <CFormInput
            type="text"
            id="edit-name"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            placeholder="e.g., Nike Air Max"
            required
          />
        </CCol>

        <CCol md={6}>
          <CFormLabel htmlFor="edit-brand">Brand</CFormLabel>
          <CFormInput
            type="text"
            id="edit-brand"
            name="brand"
            value={formData.brand}
            onChange={handleInputChange}
            placeholder="e.g., Nike"
          />
        </CCol>
      </CRow>

      <CRow className="mb-3">
        <CCol xs={12}>
          <CFormLabel htmlFor="edit-description">Description</CFormLabel>
          <CFormTextarea
            id="edit-description"
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            placeholder="Product description"
            rows="3"
          />
        </CCol>
      </CRow>

      <CRow className="mb-3">
        <CCol md={4}>
          <CFormLabel htmlFor="edit-price">
            Price <span className="text-danger">*</span>
          </CFormLabel>
          <CFormInput
            type="number"
            id="edit-price"
            name="price"
            value={formData.price}
            onChange={handleInputChange}
            placeholder="900"
            required
          />
        </CCol>

        <CCol md={4}>
          <CFormLabel htmlFor="edit-category_id">
            Category ID <span className="text-danger">*</span>
          </CFormLabel>
          <CFormInput
            type="number"
            id="edit-category_id"
            name="category_id"
            value={formData.category_id}
            onChange={handleInputChange}
            placeholder="1"
            required
          />
        </CCol>

        <CCol md={4}>
          <CFormLabel htmlFor="edit-stock_quantity">Stock Quantity</CFormLabel>
          <CFormInput
            type="number"
            id="edit-stock_quantity"
            name="stock_quantity"
            value={formData.stock_quantity}
            onChange={handleInputChange}
            placeholder="10"
          />
        </CCol>
      </CRow>

      <CRow className="mb-3">
        <CCol md={6}>
          <CFormLabel htmlFor="edit-slug">Slug</CFormLabel>
          <CFormInput
            type="text"
            id="edit-slug"
            name="slug"
            value={formData.slug}
            onChange={handleInputChange}
            placeholder="product-slug"
          />
        </CCol>

        <CCol md={6}>
          <CFormLabel htmlFor="edit-sku">SKU</CFormLabel>
          <CFormInput
            type="text"
            id="edit-sku"
            name="sku"
            value={formData.sku}
            onChange={handleInputChange}
            placeholder="SKU-123"
          />
        </CCol>
      </CRow>

      <div className="d-flex gap-2 justify-content-end mt-4">
        <CButton color="secondary" onClick={onCancel} disabled={isSubmitting}>
          Cancel
        </CButton>
        <CButton color="success" type="submit" disabled={isSubmitting}>
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

export default EditProductForm