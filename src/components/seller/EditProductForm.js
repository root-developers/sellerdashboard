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
  const [categories, setCategories] = useState([])
  const [categoriesLoading, setCategoriesLoading] = useState(true)
  const [categoriesError, setCategoriesError] = useState(null)
  const [errors, setErrors] = useState({})
  const [touched, setTouched] = useState({})
  const [formError, setFormError] = useState('')

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
      // Clear all validation states when a new product is loaded
      setErrors({})
      setTouched({})
      setFormError('')
    }
  }, [productToEdit])

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

        const activeCategories = (data.data.categories || []).filter(
          (cat) => cat.is_active === true,
        )
        setCategories(activeCategories)
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

  // Validation functions
  const validateField = (name, value) => {
    let error = ''

    switch (name) {
      case 'name':
        if (!value.trim()) {
          error = 'Product name is required'
        } else if (value.trim().length < 3) {
          error = 'Product name must be at least 3 characters'
        } else if (value.trim().length > 100) {
          error = 'Product name must not exceed 100 characters'
        }
        break

      case 'description':
        if (!value.trim()) {
          error = 'Description is required'
        } else if (value.trim().length < 10) {
          error = 'Description must be at least 10 characters'
        } else if (value.trim().length > 1000) {
          error = 'Description must not exceed 1000 characters'
        }
        break

      case 'price':
        if (!value) {
          error = 'Price is required'
        } else if (isNaN(value) || parseFloat(value).toFixed(2) <= 0) {
          error = 'Price must be greater than 0'
        } else if (parseFloat(value).toFixed(2) > 1000000) {
          error = 'Price must not exceed 1,000,000'
        } else if (value.includes('.') && value.split('.')[1].length > 2) {
          error = 'Price can only have up to two decimal places (e.g., 12.99)'
        }
        break

      case 'category_id':
        if (!value) {
          error = 'Category is required'
        }
        break

      case 'stock_quantity':
        if (!value) {
          error = 'Stock quantity is required'
        } else if (isNaN(value) || parseInt(value) < 0) {
          error = 'Stock quantity must be 0 or greater'
        } else if (parseInt(value) > 1000000) {
          error = 'Stock quantity must not exceed 1,000,000'
        }
        break

      case 'brand':
        if (!value.trim()) {
          error = 'Brand is required'
        } else if (value.trim().length < 2) {
          error = 'Brand must be at least 2 characters'
        } else if (value.trim().length > 50) {
          error = 'Brand must not exceed 50 characters'
        }
        break

      default:
        break
    }

    return error
  }

  const handleInputChange = (e) => {
    let { name, value } = e.target
    if (name === 'price') {
      // This regex allows:
      // - an empty string
      // - numbers (e.g., 123)
      // - a decimal point (e.g., 123.)
      // - numbers with one or two decimals (e.g., 123.4, 123.45)
      const priceInputRegex = /^\d*(\.\d{0,2})?$/

      // Check the value against the regex
      if (!priceInputRegex.test(value)) {
        return // stops the update, this will stop the user from typing invalid characters.
      }
      //   if (value && parseFloat(value) > 1000000) {
      //     return
      //   }
    }

    // if (name === 'stock_quantity') {
    //   const stockRegex = /^\d*$/ // Regex for whole numbers only

    //   // Check for valid format (no decimals, no negatives)
    //   if (!stockRegex.test(value)) {
    //     return
    //   }

    //   // max value (1,000,000)
    //   if (value && parseInt(value) > 1000000) {
    //     return
    //   }
    // }
    if (name === 'description') {
      if (value.length > 1000) {
        return
      }
    }
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))

    // Validate on change if field was touched
    if (touched[name]) {
      const error = validateField(name, value)
      setErrors((prev) => ({
        ...prev,
        [name]: error,
      }))
    }
  }

  const handleBlur = (e) => {
    const { name, value } = e.target
    setTouched((prev) => ({
      ...prev,
      [name]: true,
    }))

    const error = validateField(name, value)
    setErrors((prev) => ({
      ...prev,
      [name]: error,
    }))
  }

  // Check if form is valid
  const isFormValid = () => {
    const requiredFields = [
      'name',
      'description',
      'price',
      'category_id',
      'stock_quantity',
      'brand',
    ]

    // Check if all required fields are filled
    for (const field of requiredFields) {
      if (!formData[field] || formData[field].toString().trim() === '') {
        return false
      }
    }

    // Check if there are any validation errors
    for (const field of requiredFields) {
      const error = validateField(field, formData[field])
      if (error) {
        return false
      }
    }

    return true
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setFormError('') // clear previous form submission errors

    if (!productToEdit || !productToEdit.id) {
      setFormError('No product selected for editing.')
      return
    }

    // Mark all fields as touched
    const allFields = ['name', 'description', 'price', 'category_id', 'stock_quantity', 'brand']
    const newTouched = {}
    const newErrors = {}

    allFields.forEach((field) => {
      newTouched[field] = true
      const error = validateField(field, formData[field])
      if (error) {
        newErrors[field] = error
      }
    })

    setTouched(newTouched)
    setErrors(newErrors)

    // If there are any errors, don't submit
    if (Object.keys(newErrors).length > 0) {
      setFormError('Please review the form. Some fields have errors.')
      return
    }

    // Final validation check
    if (!isFormValid()) {
      setFormError('Please fill in all required fields correctly')
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
        throw new Error(errorData.error || errorData.message || 'Failed to update product')
      }

      toast.success('Product updated successfully!')
      onProductUpdated()
    } catch (error) {
      console.error('Error updating product:', error)
      setFormError(`Failed to update product: ${error.message}`)
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
            onBlur={handleBlur}
            placeholder="e.g., Nike Air Max"
            required
            minLength={3}
            maxLength={100}
            invalid={touched.name && !!errors.name}
          />
          {touched.name && errors.name && (
            <div className="invalid-feedback d-block">{errors.name}</div>
          )}
        </CCol>

        <CCol md={6}>
          <CFormLabel htmlFor="edit-brand">
            Brand <span className="text-danger">*</span>
          </CFormLabel>
          <CFormInput
            type="text"
            id="edit-brand"
            name="brand"
            value={formData.brand}
            onChange={handleInputChange}
            onBlur={handleBlur}
            placeholder="e.g., Nike"
            required
            minLength={2}
            maxLength={50}
            invalid={touched.brand && !!errors.brand}
          />
          {touched.brand && errors.brand && (
            <div className="invalid-feedback d-block">{errors.brand}</div>
          )}
        </CCol>
      </CRow>

      <CRow className="mb-3">
        <CCol xs={12}>
          <CFormLabel htmlFor="edit-description">
            Description <span className="text-danger">*</span>
          </CFormLabel>
          <CFormTextarea
            id="edit-description"
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            onBlur={handleBlur}
            placeholder="Product description (minimum 10 characters)"
            rows="3"
            required
            minLength={10}
            maxLength={1000}
            invalid={touched.description && !!errors.description}
          />
          {touched.description && errors.description && (
            <div className="invalid-feedback d-block">{errors.description}</div>
          )}
          <small className="text-medium-emphasis">
            {formData.description.length}/1000 characters
          </small>
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
            onBlur={handleBlur}
            placeholder="900"
            required
            min="0.01"
            max="1000000"
            step="0.01"
            invalid={touched.price && !!errors.price}
          />
          {touched.price && errors.price && (
            <div className="invalid-feedback d-block">{errors.price}</div>
          )}
        </CCol>

        {/* <CCol md={4}>
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
        </CCol> */}

        <CCol md={4}>
          <CFormLabel htmlFor="edit-category_id">
            Category <span className="text-danger">*</span>
          </CFormLabel>
          <CFormSelect
            id="edit-category_id"
            name="category_id"
            value={formData.category_id}
            onChange={handleInputChange}
            onBlur={handleBlur}
            required
            disabled={categoriesLoading}
            invalid={touched.category_id && !!errors.category_id}
          >
            <option value="">{categoriesLoading ? 'Loading...' : 'Select a category'}</option>
            {!categoriesLoading &&
              !categoriesError &&
              categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
          </CFormSelect>
          {touched.category_id && errors.category_id && (
            <div className="invalid-feedback d-block">{errors.category_id}</div>
          )}
          {categoriesError && <div className="text-danger small mt-1">{categoriesError}</div>}
        </CCol>

        <CCol md={4}>
          <CFormLabel htmlFor="edit-stock_quantity">
            Stock Quantity <span className="text-danger">*</span>
          </CFormLabel>
          <CFormInput
            type="number"
            id="edit-stock_quantity"
            name="stock_quantity"
            value={formData.stock_quantity}
            onChange={handleInputChange}
            onBlur={handleBlur}
            placeholder="10"
            required
            min="0"
            max="100000"
            step="1"
            invalid={touched.stock_quantity && !!errors.stock_quantity}
          />
          {touched.stock_quantity && errors.stock_quantity && (
            <div className="invalid-feedback d-block">{errors.stock_quantity}</div>
          )}
        </CCol>
      </CRow>

      {/* <CRow className="mb-3">
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
      </CRow> */}

      <div className="d-flex gap-2 justify-content-end mt-4">
        {/* Display general form error */}
        {formError && (
          <CRow className="mb-3">
            <CCol>
              <div className="text-danger text-end small">{formError}</div>
            </CCol>
          </CRow>
        )}
        <CButton color="secondary" onClick={onCancel} disabled={isSubmitting}>
          Cancel
        </CButton>
        <CButton
          color="success"
          type="submit"
          disabled={isSubmitting || !isFormValid()}
          title={!isFormValid() ? 'Please fill in all required fields correctly' : ''}
        >
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
