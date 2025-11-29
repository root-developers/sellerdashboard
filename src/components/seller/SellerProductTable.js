import React from 'react'
import {
  CTable,
  CTableHead,
  CTableRow,
  CTableHeaderCell,
  CTableBody,
} from '@coreui/react'
import SellerProductTableRow from './SellerProductTableRow'

const headerStyle = {
  fontSize: '14px',
  fontWeight: '600',
  // textTransform: 'uppercase',
  color: 'black',
  letterSpacing: '0.5px',
  // maxWidth: '30px',
  textOverflow: 'ellipsis',
  // whiteSpace: 'nowrap',
  overflow: 'hidden',
}

const SellerProductTable = ({ products, onRefresh, onEdit }) => {
  const finalProducts = products.data?.products || products || []

  return (
    <div className="table-responsive">
      <CTable align="middle" className="mb-0 border" hover responsive>
        <CTableHead color="light">
          <CTableRow>
            <CTableHeaderCell
              className="text-center"
              style={headerStyle}
            >
              Image
            </CTableHeaderCell>
            <CTableHeaderCell style={headerStyle}>
              {/* Slug */}
              Cat./Product No.
            </CTableHeaderCell>
            <CTableHeaderCell style={headerStyle}>
              Product Name
            </CTableHeaderCell>
            <CTableHeaderCell style={headerStyle}>
              Brand
            </CTableHeaderCell>
            <CTableHeaderCell style={headerStyle}>
              Category Name
            </CTableHeaderCell>
            <CTableHeaderCell style={headerStyle}>
              Price
            </CTableHeaderCell>
            <CTableHeaderCell
              className="text-center"
              style={headerStyle}
            >
              Stock Status
            </CTableHeaderCell>
            {/* <CTableHeaderCell >
              SKU
            </CTableHeaderCell> */}
            <CTableHeaderCell
              className="text-center"
              style={headerStyle}
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
