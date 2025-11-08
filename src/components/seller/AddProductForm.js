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
  CFormSelect,
} from '@coreui/react'
import { useSelector } from 'react-redux'
import Config from '../../config/Config'

const AddProductForm = ({ onProductAdded, onCancel }) => {
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
  const [imageFile, setImageFile] = useState(null)
  const [categories, setCategories] = useState([])
  const [categoriesLoading, setCategoriesLoading] = useState(true)
  const [categoriesError, setCategoriesError] = useState(null)

  // useEffect to fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setCategoriesLoading(true)
        setCategoriesError(null)
        const response = await fetch(`${Config.baseUrl}/categories`, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${user.token}`,
            'Content-Type': 'application/json',
          },
        })

        if (!response.ok) {
          throw new Error('Failed to fetch categories')
        }

        const data = await response.json()

        setCategories(data.data.categories || [])
      } catch (error) {
        console.error('Error fetching categories:', error)
        setCategoriesError('Failed to load categories.')
        toast.error('Failed to load categories')
      } finally {
        setCategoriesLoading(false)
      }
    }

    if (user?.token) {
      fetchCategories()
    } else {
      setCategoriesLoading(false)
      setCategoriesError('Not authenticated.')
    }
  }, [user?.token])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setImageFile(e.target.files[0])
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    // Validation
    if (!formData.name || !formData.price || !formData.category_id) {
      toast.error('Please fill in all required fields')
      return
    }

    setIsSubmitting(true)

    try {
      // Create FormData for file upload
      const submitData = new FormData()
      submitData.append('name', formData.name)
      submitData.append('description', formData.description)
      submitData.append('price', formData.price)
      submitData.append('category_id', formData.category_id)
      submitData.append('stock_quantity', formData.stock_quantity)
      submitData.append('brand', formData.brand)
      submitData.append('slug', formData.slug)
      submitData.append('sku', formData.sku)

      if (imageFile) {
        submitData.append('images', imageFile)
      }

      const response = await fetch(`${Config.baseUrl}/products`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${user.token}`,
          // Don't set Content-Type for FormData, browser will set it automatically with boundary
        },
        body: submitData,
      })

      if (!response.ok) {
        throw new Error('Failed to create product')
      }

      const data = await response.json()
      console.log('Product created:', data)

      // Reset form
      setFormData({
        name: '',
        description: '',
        price: '',
        category_id: '',
        stock_quantity: '',
        brand: '',
        slug: '',
        sku: '',
      })
      setImageFile(null)

      onProductAdded()
    } catch (error) {
      console.error('Error creating product:', error)
      toast.error('Failed to create product')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="border-top pt-4">
      <h5 className="mb-4">Add New Product</h5>

      <CForm onSubmit={handleSubmit}>
        <CRow className="mb-3">
          <CCol md={6}>
            <CFormLabel htmlFor="name">
              Product Name <span className="text-danger">*</span>
            </CFormLabel>
            <CFormInput
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="e.g., Nike Air Max"
              required
            />
          </CCol>

          <CCol md={6}>
            <CFormLabel htmlFor="brand">Brand <span className="text-danger">*</span>
            </CFormLabel>
            <CFormInput
              type="text"
              id="brand"
              name="brand"
              value={formData.brand}
              onChange={handleInputChange}
              placeholder="e.g., Nike"
            />
          </CCol>
        </CRow>

        <CRow className="mb-3">
          <CCol xs={12}>
            <CFormLabel htmlFor="description">Description <span className="text-danger">*</span>
            </CFormLabel>
            <CFormTextarea
              id="description"
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
            <CFormLabel htmlFor="price">
              Price <span className="text-danger">*</span>
            </CFormLabel>
            <CFormInput
              type="number"
              id="price"
              name="price"
              value={formData.price}
              onChange={handleInputChange}
              placeholder="900"
              required
            />
          </CCol>

          {/* <CCol md={4}>
            <CFormLabel htmlFor="category_id">
              Category ID <span className="text-danger">*</span>
            </CFormLabel>
            <CFormInput
              type="number"
              id="category_id"
              name="category_id"
              value={formData.category_id}
              onChange={handleInputChange}
              placeholder="1"
              required
            />
          </CCol> */}

          <CCol md={4}>
            <CFormLabel htmlFor="category_id">
              Category <span className="text-danger">*</span>
            </CFormLabel>
            <CFormSelect
              id="category_id"
              name="category_id"
              value={formData.category_id}
              onChange={handleInputChange}
              required
              disabled={categoriesLoading}
            >
              <option value="">
                {categoriesLoading
                  ? 'Loading categories...'
                  : categoriesError
                    ? 'Error loading categories'
                    : 'Select a category'}
              </option>
              {!categoriesLoading &&
                !categoriesError &&
                categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
            </CFormSelect>
            {categoriesError && <div className="text-danger small mt-1">{categoriesError}</div>}
          </CCol>


          <CCol md={4}>
            <CFormLabel htmlFor="stock_quantity">Stock Quantity
              <span className="text-danger">*</span>
            </CFormLabel>
            <CFormInput
              type="number"
              id="stock_quantity"
              name="stock_quantity"
              value={formData.stock_quantity}
              onChange={handleInputChange}
              placeholder="10"
            />
          </CCol>
        </CRow>

        {/* <CRow className="mb-3">
          <CCol md={6}>
            <CFormLabel htmlFor="slug">Slug</CFormLabel>
            <CFormInput
              type="text"
              id="slug"
              name="slug"
              value={formData.slug}
              onChange={handleInputChange}
              placeholder="product-slug"
            />
          </CCol>

          <CCol md={6}>
            <CFormLabel htmlFor="sku">SKU</CFormLabel>
            <CFormInput
              type="text"
              id="sku"
              name="sku"
              value={formData.sku}
              onChange={handleInputChange}
              placeholder="SKU-123"
            />
          </CCol>
        </CRow> */}

        <CRow className="mb-4">
          <CCol xs={12}>
            <CFormLabel htmlFor="image">Product Image</CFormLabel>
            <CFormInput type="file" id="image" accept="image/*" onChange={handleImageChange} />
            {imageFile && (
              <small className="text-medium-emphasis d-block mt-2">{imageFile.name}</small>
            )}
          </CCol>
        </CRow>

        <div className="d-flex gap-2 justify-content-end">
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
              'Create Product'
            )}
          </CButton>
        </div>
      </CForm>
    </div>
  )
}

export default AddProductForm