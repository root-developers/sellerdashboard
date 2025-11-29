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
  CCardFooter,
  CPagination,
  CPaginationItem,
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilPlus, cilX } from '@coreui/icons'
import { useSelector } from 'react-redux'
import AddProductForm from '../../../components/seller/AddProductForm'
import EditProductForm from '../../../components/seller/EditProductForm'
import SellerProductTable from '../../../components/seller/SellerProductTable'
import Config from '../../../config/Config'

const Products = () => {
  const user = useSelector((state) => state.UserReducer.user)

  const [products, setProducts] = useState([])
  const [pagination, setPagination] = useState(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [isLoading, setIsLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)
  const [refreshTrigger, setRefreshTrigger] = useState(0)
  const [showEditModal, setShowEditModal] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState(null)

  // Fetch seller's products
  useEffect(() => {
    fetchSellerProducts(currentPage)
  }, [refreshTrigger, currentPage])

  const fetchSellerProducts = async (Page = 1) => {
    setIsLoading(true)
    try {
      const response = await fetch(`${Config.baseUrl}/products/seller/my-products?page=${Page}`, {
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
      // setProducts(data.products || data || [])
      setProducts(data.data.products || [])
      setPagination(data.data.pagination || null)
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

  const handlePageChange = (pageNumber) => {
    if (pageNumber < 1 || (pagination && pageNumber > pagination.total_pages) || pageNumber === currentPage) {
      return
    }
    // Set the new page, which will trigger the useEffect to re-fetch
    setCurrentPage(pageNumber)
  }

  const handleEditClick = (product) => {
    setSelectedProduct(product)
    setShowEditModal(true)
  }

  const handleEditCancel = () => {
    setShowEditModal(false)
    setSelectedProduct(null)
  }

  const handleProductUpdated = () => {
    setShowEditModal(false)
    setSelectedProduct(null)
    setRefreshTrigger((prev) => prev + 1) // Refresh the product list
    toast.success('Product updated successfully!')
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
                My Products({pagination ? pagination.total_items : 0})
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
                  onEdit={handleEditClick}
                />
              )}
            </CCardBody>
            {pagination && pagination.total_pages > 1 && (
              <CCardFooter>
                <CPagination align="end" aria-label="Page navigation">
                  <CPaginationItem
                    disabled={currentPage === 1}
                    onClick={() => handlePageChange(currentPage - 1)}
                    aria-label="Previous"
                  >
                    <span aria-hidden="true">&laquo;</span>
                  </CPaginationItem>
                  {[...Array(pagination.total_pages).keys()].map((page) => (
                    <CPaginationItem
                      key={page + 1}
                      active={page + 1 === currentPage}
                      onClick={() => handlePageChange(page + 1)}
                    >
                      {page + 1}
                    </CPaginationItem>
                  ))}
                  <CPaginationItem
                    disabled={currentPage === pagination.total_pages}
                    onClick={() => handlePageChange(currentPage + 1)}
                    aria-label="Next"
                  >
                    <span aria-hidden="true">&raquo;</span>
                  </CPaginationItem>
                </CPagination>
              </CCardFooter>
            )}
          </CCard>
        </CCol>
      </CRow>
      {/* --- Edit Product Modal --- */}
      <CModal size="lg" visible={showEditModal} onClose={handleEditCancel}>
        <CModalHeader>
          <CModalTitle>Edit Product</CModalTitle>
        </CModalHeader>
        <CModalBody>
          {selectedProduct && (
            <EditProductForm
              productToEdit={selectedProduct}
              onProductUpdated={handleProductUpdated}
              onCancel={handleEditCancel}
            />
          )}
        </CModalBody>
      </CModal>
    </>
  )
}

export default Products