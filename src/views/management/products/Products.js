import React, { useState, useEffect } from 'react'
import { toast } from 'react-toastify'
import {
  CButton,
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CRow,
  CSpinner,
  CCollapse,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilPlus, cilX } from '@coreui/icons'
import { useSelector } from 'react-redux'
import AddProductForm from '../../../components/seller/AddProductForm'
import SellerProductTable from '../../../components/seller/SellerProductTable'
import Config from '../../../config/Config'

const Products = () => {
  const user = useSelector((state) => state.UserReducer.user)

  const [products, setProducts] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  // Fetch seller's products
  useEffect(() => {
    fetchSellerProducts()
  }, [refreshTrigger])

  const fetchSellerProducts = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`${Config.apiUrl}/products/seller/my-products`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user.token}`,
        },
      })

      if (!response.ok) {
        throw new Error('Failed to fetch products')
      }

      const data = await response.json()
      setProducts(data.products || data || [])
      toast.success('Products loaded successfully')
    } catch (error) {
      console.error('Error fetching products:', error)
      toast.error('Failed to load products')
    } finally {
      setIsLoading(false)
    }
  }

  const handleProductAdded = () => {
    setShowAddForm(false)
    setRefreshTrigger((prev) => prev + 1)
    toast.success('Product added successfully!')
  }

  return (
    <>
      <CRow>
        <CCol xs={12}>
          <CCard className="mb-4">
            <CCardHeader className="d-flex justify-content-between align-items-center">
              <h4 className="mb-0 fw-semibold" style={{ fontSize: '18px', letterSpacing: '-0.02em' }}>
                Seller Dashboard
              </h4>
              <CButton
                color={showAddForm ? 'secondary' : 'success'}
                onClick={() => setShowAddForm(!showAddForm)}
                className="d-flex align-items-center"
                style={{ fontSize: '14px', fontWeight: '500' }}
              >
                <CIcon icon={showAddForm ? cilX : cilPlus} className="me-2" />
                {showAddForm ? 'Close Form' : 'Add New Product'}
              </CButton>
            </CCardHeader>
            <CCardBody>
              <CCollapse visible={showAddForm}>
                <AddProductForm
                  onProductAdded={handleProductAdded}
                  onCancel={() => setShowAddForm(false)}
                />
              </CCollapse>
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>

      <CRow>
        <CCol xs={12}>
          <CCard className="mb-4">
            <CCardHeader>
              <h4 className="mb-0 fw-semibold" style={{ fontSize: '18px', letterSpacing: '-0.02em' }}>
                My Products
              </h4>
            </CCardHeader>
            <CCardBody>
              {isLoading ? (
                <div className="text-center py-5">
                  <CSpinner color="primary" />
                  <p className="text-medium-emphasis mt-2" style={{ fontSize: '14px' }}>
                    Loading products...
                  </p>
                </div>
              ) : (
                <SellerProductTable
                  products={products}
                  onRefresh={() => setRefreshTrigger((prev) => prev + 1)}
                />
              )}
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>
    </>
  )
}

export default Products