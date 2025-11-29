import React, { useState } from 'react'
import { useSelector } from 'react-redux'
import { toast } from 'react-toastify'
import {
  CTableRow,
  CTableDataCell,
  CButton,
  CSpinner,
  CDropdown,
  CDropdownToggle,
  CDropdownMenu,
  CDropdownItem,
  CBadge,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilOptions, cilPencil, cilTrash, cilUser } from '@coreui/icons'
import Config from '../../config/Config'

const textStyle = { fontSize: '13px', color: 'black', fontWeight: '400', maxWidth: '200px', display: 'block', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' };

const SellerProductTableRow = ({ product, onRefresh, onEdit, onAssign }) => {
  const [isDeleting, setIsDeleting] = useState(false)
  // const [isEditing, setIsEditing] = useState(false)
  const user = useSelector((state) => state.UserReducer.user)

  const handleDelete = async () => {
    if (!window.confirm(`Are you sure you want to delete "${product.name}"?`)) return
    setIsDeleting(true)
    try {
      const response = await fetch(`${Config.baseUrl}/products/${product.id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${user.token}`,
          'Content-Type': 'application/json',
        },
      })
      if (!response.ok) throw new Error('Failed to delete product')
      toast.success('Product deleted successfully')
      onRefresh()
    } catch (error) {
      toast.error('Failed to delete product')
    } finally {
      setIsDeleting(false)
    }
  }

  // const handleEdit = async () => {
  //   if (!window.confirm(`Are you sure you want to edit "${product.name}"?`)) return
  //   setIsEditing(true)
  //   try {
  //     const response = await fetch(`${Config.apiUrl}/products/${product.id}`, {
  //       method: 'PUT',
  //       headers: {
  //         Authorization: `Bearer ${user.token}`,
  //         'Content-Type': 'application/json',
  //       },
  //     })
  //     if (!response.ok) throw new Error('Failed to edit product')
  //     toast.success('Product edited successfully')
  //     onRefresh()
  //   } catch (error) {
  //     toast.error('Failed to edit product')
  //   } finally {
  //     setIsEditing(false)
  //   }
  // }

  const handleEdit = () => {
    // use the onEdit prop 
    onEdit(product)
  }

  const imageUrl =
    product.images?.[0]?.image_url || product.image || 'https://via.placeholder.com/100'

  return (
    <CTableRow>
      <CTableDataCell className="text-center">
        <div className="d-flex justify-content-center">
          <img
            src={imageUrl}
            alt={product.name}
            style={{
              width: '48px',
              height: '48px',
              objectFit: 'cover',
              borderRadius: '6px',
            }}
          />
        </div>
      </CTableDataCell>
      <CTableDataCell>
        <span style={textStyle}>
          {product.category_id}-{product.slug || '-'}
        </span>
      </CTableDataCell>
      <CTableDataCell>
        <div style={textStyle}>
          {product.name}
        </div>
        {product.description && (
          <div style={{ fontSize: '12px', color: '#6c757d', marginTop: '2px', maxWidth: '150px', display: 'block', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {product.description.substring(0, 50)}
            {product.description.length > 50 ? '...' : ''}
          </div>
        )}
      </CTableDataCell>
      <CTableDataCell>
        <span style={textStyle}>
          {product.brand || '-'}
        </span>
      </CTableDataCell>
      <CTableDataCell>
        <span style={textStyle}>
          {product.category.name || '-'}
        </span>
      </CTableDataCell>
      <CTableDataCell>
        <span style={textStyle}>
          ₹{parseFloat(product.price).toFixed(2)}
        </span>
      </CTableDataCell>
      <CTableDataCell className="text-center">
        {product.stock_quantity > 0 ? (
          <CBadge
            color="success"
            style={{ fontSize: '11px', fontWeight: '500', padding: '4px 4px' }}
          >
            In Stock ({product.stock_quantity})
          </CBadge>
        ) : (
          <CBadge
            color="danger"
            style={{ fontSize: '11px', fontWeight: '500', padding: '4px 4px' }}
          >
            Out of Stock
          </CBadge>
        )}
      </CTableDataCell>
      {/* <CTableDataCell>
        <span style={{ fontSize: '13px', color: '#6c757d', fontWeight: '400' }}>
          {product.sku || '-'}
        </span>
      </CTableDataCell> */}
      <CTableDataCell className="text-center">
        <CDropdown alignment="end">
          <CDropdownToggle color="ghost" size="sm" caret={false} disabled={isDeleting}
            style={textStyle}>
            {isDeleting ? (
              <CSpinner size="sm" />
            ) : (
              <CIcon icon={cilOptions} />
            )}
          </CDropdownToggle>
          <CDropdownMenu>
            <CDropdownItem
              onClick={handleEdit}
              // disabled={isEditing}
              style={textStyle}
              className='text-black'
            >
              <CIcon icon={cilPencil} className="me-2" />
              Edit
            </CDropdownItem>
            {user?.role === Config.userType.ADMIN && (
              <CDropdownItem
                onClick={() => onAssign(product)}
                style={textStyle}
                className='text-black'>
                <CIcon icon={cilUser} className="me-2" />
                Allot to seller
              </CDropdownItem>
            )}
            <CDropdownItem
              onClick={handleDelete}
              disabled={isDeleting}
              className="text-danger"
              style={textStyle}
            >
              <CIcon icon={cilTrash} className="me-2" />
              {isDeleting ? 'Deleting...' : 'Delete'}
            </CDropdownItem>
          </CDropdownMenu>
        </CDropdown>
      </CTableDataCell>
    </CTableRow>
  )
}

export default SellerProductTableRow
