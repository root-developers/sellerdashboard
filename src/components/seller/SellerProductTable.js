import React from 'react'
import {
  CTable,
  CTableHead,
  CTableRow,
  CTableHeaderCell,
  CTableBody,
} from '@coreui/react'
import SellerProductTableRow from './SellerProductTableRow'

const SellerProductTable = ({ products, onRefresh, onEdit }) => {
  const finalProducts = products.data?.products || products || []

  return (
    <div className="table-responsive">
      <CTable align="middle" className="mb-0 border" hover responsive>
        <CTableHead color="light">
          <CTableRow style={{ fontSize: '13px', fontWeight: '600', letterSpacing: '-0.01em' }}>
            <CTableHeaderCell
              className="text-center"
            >
              Image
            </CTableHeaderCell>
            <CTableHeaderCell>
              {/* Slug */}
              Product No.
            </CTableHeaderCell>
            <CTableHeaderCell>
              Product Name
            </CTableHeaderCell>
            <CTableHeaderCell >
              Brand
            </CTableHeaderCell>
            <CTableHeaderCell >
              Category Name
            </CTableHeaderCell>
            <CTableHeaderCell >
              Price
            </CTableHeaderCell>
            <CTableHeaderCell
              className="text-center"
            >
              Stock Status
            </CTableHeaderCell>
            {/* <CTableHeaderCell >
              SKU
            </CTableHeaderCell> */}
            <CTableHeaderCell
              className="text-center"
            >
              Actions
            </CTableHeaderCell>
          </CTableRow>
        </CTableHead>
        <CTableBody>
          {finalProducts.length > 0 ? (
            finalProducts.map((product) => (
              <SellerProductTableRow
                key={product.id}
                product={product}
                onRefresh={onRefresh}
                onEdit={onEdit}
              />
            ))
          ) : (
            <CTableRow>
              <CTableHeaderCell
                colSpan="9"
                className="text-center text-medium-emphasis py-4"
                style={{ fontSize: '14px', fontWeight: '400' }}
              >
                No products found. Add your first product to get started.
              </CTableHeaderCell>
            </CTableRow>
          )}
        </CTableBody>
      </CTable>
    </div>
  )
}

export default SellerProductTable
