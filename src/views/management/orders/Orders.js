import React, { useState, useEffect, useMemo, useCallback } from 'react'
import axios from 'axios'
import { toast } from 'react-toastify'
import {
    CAvatar,
    CBadge,
    CButton,
    CCard,
    CCardBody,
    CCardHeader,
    CCol,
    CFormInput,
    CRow,
    CTable,
    CTableBody,
    CTableDataCell,
    CTableHead,
    CTableHeaderCell,
    CTableRow,
    CSpinner,
    CDropdown,
    CDropdownToggle,
    CDropdownMenu,
    CDropdownItem,
    CModal,
    CModalHeader,
    CModalTitle,
    CModalBody,
    CModalFooter,
    CFormLabel,
    CFormTextarea,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import {
    cilSearch,
    cilFilter,
    cilOptions,
    cilPlus,
    cilArrowTop,
    cilArrowBottom,
    cilFullscreen,
    cilSortAlphaUp,
    cilSwapVertical,
} from '@coreui/icons'
import Config from '../../../config/Config'


// Order Status Constants
const ORDER_STATUS = {
    PENDING: 'pending',
    CONFIRMED: 'confirmed',
    SHIPPED: 'shipped',
    DELIVERED: 'delivered',
    CANCELLED: 'cancelled',
}

// Memoized StatCard Component
const StatCard = React.memo(({ value, percentage, isPositive, description, isCurrency }) => (
    <CCol sm={6} lg={3}>
        <CCard className="mb-4">
            <CCardBody>
                <div className="d-flex justify-content-between align-items-start">
                    <div>
                        <h2 className="mb-0 fw-bold">
                            {isCurrency && 'Rs. '}{typeof value === 'number' ? value.toLocaleString() : value}
                        </h2>
                        <div className={`${isPositive ? 'text-success' : 'text-danger'} small`}>
                            <CIcon icon={isPositive ? cilArrowTop : cilArrowBottom} size="sm" /> {isPositive ? '+' : ''}{percentage}%
                        </div>
                        <p className="text-medium-emphasis small mb-0 mt-1">
                            {description}
                        </p>
                    </div>
                </div>
            </CCardBody>
        </CCard>
    </CCol>
))
StatCard.displayName = 'StatCard'

// Memoized OrderRow Component
const OrderRow = React.memo(({ order, onUpdateStatus, getStatusBadge }) => (
    <CTableRow>
        <CTableDataCell>
            <span style={{ fontSize: '13px', color: '#6c757d', fontWeight: '400' }}>
                {order.order_number}
            </span>
        </CTableDataCell>
        <CTableDataCell>
            <div className="d-flex align-items-center">
                <CAvatar size="sm" color="primary" textColor="white" className="me-2">
                    {order.buyer_first_name ? order.buyer_first_name[0].toUpperCase() : '?'}
                </CAvatar>
                <span style={{ fontSize: '14px', fontWeight: '500', color: '#2c3e50', letterSpacing: '-0.01em' }}>
                    {order.buyer_first_name ? order.buyer_last_name ? `${order.buyer_first_name} ${order.buyer_last_name}` : `${order.buyer_first_name}` : 'Buyer'}
                </span>
            </div>
        </CTableDataCell>
        <CTableDataCell>
            <div>
                <div style={{ fontSize: '12px', color: '#6c757d', marginBottom: '2px' }}>
                    {order.buyer_email}
                </div>
                <div style={{ fontSize: '12px', color: '#6c757d' }}>
                    {order.phone || ''}
                </div>
            </div>
        </CTableDataCell>
        <CTableDataCell>
            <img
                src={order.product_image?.[0]?.product_image || order.product_image || 'https://via.placeholder.com/100'}
                alt={order.product_name}
                style={{
                    width: '48px',
                    height: '48px',
                    objectFit: 'contain',
                    borderRadius: '6px',
                }}
            />
        </CTableDataCell>
        <CTableDataCell>
            <span style={{ fontSize: '13px', color: '#2c3e50', fontWeight: '400' }}>
                {order.product_name} (Qty: {order.quantity})
            </span>
        </CTableDataCell>
        <CTableDataCell>
            <span style={{ fontSize: '14px', fontWeight: '600', color: '#2c3e50' }}>
                Rs. {Number(order.total_price).toLocaleString()}
            </span>
        </CTableDataCell>
        <CTableDataCell>{getStatusBadge(order.status)}</CTableDataCell>
        <CTableDataCell>
            <CDropdown alignment="end">
                <CDropdownToggle color="ghost" size="sm">
                    <CIcon icon={cilOptions} />
                </CDropdownToggle>
                <CDropdownMenu>
                    <CDropdownItem
                        onClick={() => onUpdateStatus(order)}
                        style={{ fontSize: '13px', fontWeight: '400' }}
                    >
                        Update Status
                    </CDropdownItem>
                </CDropdownMenu>
            </CDropdown>
        </CTableDataCell>
    </CTableRow>
))
OrderRow.displayName = 'OrderRow'

const Orders = () => {
    const [searchTerm, setSearchTerm] = useState('')
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [selectedOrder, setSelectedOrder] = useState(null)
    const [showStatusModal, setShowStatusModal] = useState(false)
    const [statusUpdate, setStatusUpdate] = useState({
        status: '',
        tracking_number: '',
        notes: '',
    })

    // Orders data from API
    const [orders, setOrders] = useState([])

    // Fetch orders from API on component mount
    useEffect(() => {
        fetchOrders()
    }, [])

    // GET /seller/orders - Fetch all seller orders
    const fetchOrders = async () => {
        try {
            setLoading(true)
            setError(null)
            const response = await axios.get(
                `${Config.apiUrl}/orders/seller/orders`,
                Config.AxiosConfig
            )

            if (response.data && response.data.success) {
                const ordersData = response.data.data.orders || []
                setOrders(ordersData)
            } else {
                setOrders([])
                setError('Failed to fetch orders')
            }
        } catch (err) {
            console.error('Error fetching orders:', err)
            setError(err.response?.data?.message || err.message || 'Failed to load orders')
            setOrders([])
        } finally {
            setLoading(false)
        }
    }

    const stats = useMemo(() => {
        const validOrders = Array.isArray(orders) ? orders : [];

        // Create a Set of unique order IDs to avoid double-counting
        const uniqueOrderIds = new Set(validOrders.map(o => o.order_id));

        // Calculate revenue from unique orders only
        const uniqueOrders = Array.from(uniqueOrderIds).map(orderId => {
            return validOrders.find(o => o.order_id === orderId);
        });

        const totalRevenue = uniqueOrders.reduce((sum, order) => sum + (Number(order.total_amount) || 0), 0);

        return {
            totalOrders: uniqueOrderIds.size, // Count unique orders
            totalRevenue: totalRevenue,
            pendingOrders: uniqueOrders.filter(o => o.status === ORDER_STATUS.PENDING).length,
            avgOrderValue: uniqueOrderIds.size > 0
                ? totalRevenue / uniqueOrderIds.size
                : 0,
        }
    }, [orders])


    // PUT /:id/status - Update order status
    const updateOrderStatus = async (orderId) => {
        try {
            const response = await axios.put(
                `${Config.apiUrl}/orders/${selectedOrder.order_id}/status`,
                {
                    status: statusUpdate.status,
                    tracking_number: statusUpdate.tracking_number,
                    notes: statusUpdate.notes,
                },
                Config.AxiosConfig
            )

            if (response.data && response.data.success) {
                // Update local state
                setOrders(prevOrders =>
                    prevOrders.map(order =>
                        order.order_id === orderId
                            ? { ...order, ...statusUpdate }
                            : order
                    )
                )
                handleCloseModal()
                toast.success('Order status updated successfully!')
            } else {
                throw new Error(response.data?.message || 'Failed to update order status')
            }
        } catch (err) {
            console.error('Error updating order status:', err)
            toast.error(err.response?.data?.message || err.message || 'Failed to update order status')
        }
    }

    // Handle opening the status modal
    const handleUpdateStatus = useCallback((order) => {
        setSelectedOrder(order)
        setStatusUpdate({
            status: order.status,
            tracking_number: order.tracking_number || '',
            notes: order.notes || '',
        })
        setShowStatusModal(true)
    }, [])

    // Handle modal close
    const handleCloseModal = useCallback(() => {
        setShowStatusModal(false)
        setSelectedOrder(null)
        setStatusUpdate({ status: '', tracking_number: '', notes: '' })
    }, [])

    // Handle status update submission
    const handleStatusUpdateSubmit = useCallback(() => {
        if (!selectedOrder || !statusUpdate.status) return

        // Call API to update order status
        updateOrderStatus(selectedOrder.order_id)
    }, [selectedOrder, statusUpdate])

    // Get status badge component - Memoized callback
    const getStatusBadge = useCallback((status) => {
        const statusLower = (status || '').toLowerCase()
        const badgeStyle = { fontSize: '11px', fontWeight: '500', padding: '4px 8px' }
        switch (statusLower) {
            case ORDER_STATUS.DELIVERED:
                return <CBadge color="success" style={badgeStyle}>Delivered</CBadge>
            case ORDER_STATUS.SHIPPED:
                return <CBadge color="info" style={badgeStyle}>Shipped</CBadge>
            case ORDER_STATUS.CONFIRMED:
                return <CBadge color="warning" style={badgeStyle}>Confirmed</CBadge>
            case ORDER_STATUS.CANCELLED:
                return <CBadge color="danger" style={badgeStyle}>Cancelled</CBadge>
            case ORDER_STATUS.PENDING:
                return <CBadge color="secondary" style={badgeStyle}>Pending</CBadge>
            default:
                return <CBadge color="secondary" style={badgeStyle}>{status}</CBadge>
        }
    }, [])

    // Filtered orders with search
    const filteredOrders = useMemo(() => {
        const validOrders = Array.isArray(orders) ? orders : [];
        if (!searchTerm.trim()) return validOrders;

        const searchLower = searchTerm.toLowerCase()
        return validOrders.filter((order) =>
            (order.buyer_first_name || '').toLowerCase().includes(searchLower) ||
            (order.buyer_last_name || '').toLowerCase().includes(searchLower) ||
            (order.order_number || '').toLowerCase().includes(searchLower) ||
            (order.buyer_email || '').toLowerCase().includes(searchLower) ||
            (order.product_name || '').toLowerCase().includes(searchLower)
        )
    }, [orders, searchTerm])

    if (loading) {
        return (
            <div className="text-center py-5">
                <CSpinner color="primary" />
                <p className="mt-3">Loading orders...</p>
            </div>
        )
    }

    if (error) {
        return (
            <CCard>
                <CCardBody>
                    <div className="text-center text-danger py-4">
                        <p>{error}</p>
                        <CButton color="primary" onClick={fetchOrders}>
                            Retry
                        </CButton>
                    </div>
                </CCardBody>
            </CCard>
        )
    }

    return (
        <>
            {/* Stats Cards */}
            <CRow className="mb-4">
                <StatCard
                    value={stats.totalOrders}
                    percentage={4.3}
                    isPositive={true}
                    description="Increased by +1,238 this week"
                />
                <StatCard
                    value={stats.pendingOrders}
                    percentage={12.5}
                    isPositive={true}
                    description="Increased by +467 this week"
                />
                <StatCard
                    value={stats.totalRevenue}
                    percentage={0.3}
                    isPositive={false}
                    isCurrency={true}
                    description="Decreased by -$2.2 this week"
                />
                <StatCard
                    value={Math.round(stats.avgOrderValue)}
                    percentage={2.3}
                    isPositive={true}
                    isCurrency={true}
                    description="Increased by +2.3% this week"
                />
            </CRow>

            {/* Orders Table */}
            <CCard>
                <CCardHeader>
                    <CRow className="align-items-center">
                        <CCol xs={12} md={6}>
                            <h5 className="mb-0 fw-semibold" style={{ fontSize: '18px', letterSpacing: '-0.02em' }}>
                                Orders List
                            </h5>
                        </CCol>
                        <CCol xs={12} md={6} className="text-md-end mt-2 mt-md-0">
                            <div className="d-flex gap-2 justify-content-md-end">
                                <div className="position-relative" style={{ maxWidth: '250px' }}>
                                    <CFormInput
                                        type="text"
                                        placeholder="Search..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="pe-5"
                                        style={{ fontSize: '14px' }}
                                    />
                                    <CIcon
                                        icon={cilSearch}
                                        className="position-absolute top-50 end-0 translate-middle-y me-2"
                                        style={{ pointerEvents: 'none' }}
                                    />
                                </div>
                                <CButton color="light" style={{ fontSize: '14px', fontWeight: '500' }}>
                                    <CIcon icon={cilFilter} /> Filter
                                </CButton>
                                <CButton color="light" style={{ fontSize: '14px', fontWeight: '500' }}>
                                    <CIcon icon={cilSwapVertical} /> Sort By
                                </CButton>
                                <CButton color="success" style={{ fontSize: '14px', fontWeight: '500' }}>
                                    <CIcon icon={cilFullscreen} />
                                </CButton>
                            </div>
                        </CCol>
                    </CRow>
                </CCardHeader>
                <CCardBody className="p-0">
                    <div className="table-responsive">
                        <CTable align="middle" className="mb-0" hover>
                            <CTableHead color="light">
                                <CTableRow>
                                    <CTableHeaderCell style={{ fontSize: '13px', fontWeight: '600', letterSpacing: '-0.01em' }}>
                                        Order ID
                                    </CTableHeaderCell>
                                    <CTableHeaderCell style={{ fontSize: '13px', fontWeight: '600', letterSpacing: '-0.01em' }}>
                                        Buyer Name
                                    </CTableHeaderCell>
                                    <CTableHeaderCell style={{ fontSize: '13px', fontWeight: '600', letterSpacing: '-0.01em' }}>
                                        Contact
                                    </CTableHeaderCell>
                                    <CTableHeaderCell style={{ fontSize: '13px', fontWeight: '600', letterSpacing: '-0.01em' }}>
                                        Product Image
                                    </CTableHeaderCell>
                                    <CTableHeaderCell style={{ fontSize: '13px', fontWeight: '600', letterSpacing: '-0.01em' }}>
                                        Product Name
                                    </CTableHeaderCell>
                                    <CTableHeaderCell style={{ fontSize: '13px', fontWeight: '600', letterSpacing: '-0.01em' }}>
                                        Total Amount
                                    </CTableHeaderCell>
                                    <CTableHeaderCell style={{ fontSize: '13px', fontWeight: '600', letterSpacing: '-0.01em' }}>
                                        Status
                                    </CTableHeaderCell>
                                    <CTableHeaderCell></CTableHeaderCell>
                                </CTableRow>
                            </CTableHead>
                            <CTableBody>
                                {filteredOrders.length > 0 ? (
                                    filteredOrders.map((order) => (
                                        <OrderRow
                                            key={`${order.order_id}-${order.product_id}`}
                                            order={order}
                                            onUpdateStatus={handleUpdateStatus}
                                            getStatusBadge={getStatusBadge}
                                        />
                                    ))
                                ) : (
                                    <CTableRow>
                                        <CTableDataCell
                                            colSpan="8"
                                            className="text-center py-4"
                                            style={{ fontSize: '14px', fontWeight: '400' }}
                                        >
                                            No orders found
                                        </CTableDataCell>
                                    </CTableRow>
                                )}
                            </CTableBody>
                        </CTable>
                    </div>
                </CCardBody>
            </CCard>

            {/* Update Status Modal */}
            <CModal visible={showStatusModal} onClose={handleCloseModal} size="lg">
                <CModalHeader>
                    <CModalTitle>Update Order Status</CModalTitle>
                </CModalHeader>
                <CModalBody>
                    {selectedOrder && (
                        <div>
                            <div className="mb-3">
                                <p className="mb-1"><strong>Order ID:</strong> {selectedOrder.order_id}</p>
                                <p className="mb-1"><strong>Buyer:</strong> {selectedOrder.buyer_first_name ? selectedOrder.buyer_last_name ? `${selectedOrder.buyer_first_name} ${selectedOrder.buyer_last_name}` : `${selectedOrder.buyer_first_name}` : 'Buyer'}</p>
                                <p className="mb-1"><strong>Current Status:</strong> {getStatusBadge(selectedOrder.status)}</p>
                            </div>
                            <hr />
                            <div className="mb-3">
                                <CFormLabel htmlFor="statusSelect">New Status *</CFormLabel>
                                <select
                                    id="statusSelect"
                                    className="form-select"
                                    value={statusUpdate.status}
                                    onChange={(e) => setStatusUpdate({ ...statusUpdate, status: e.target.value })}
                                >
                                    <option value="">Select Status</option>
                                    <option value={ORDER_STATUS.PENDING}>Pending</option>
                                    <option value={ORDER_STATUS.CONFIRMED}>Confirmed</option>
                                    <option value={ORDER_STATUS.SHIPPED}>Shipped</option>
                                    <option value={ORDER_STATUS.DELIVERED}>Delivered</option>
                                    <option value={ORDER_STATUS.CANCELLED}>Cancelled</option>
                                </select>
                            </div>
                            <div className="mb-3">
                                <CFormLabel htmlFor="trackingNumber">Tracking Number</CFormLabel>
                                <CFormInput
                                    type="text"
                                    id="trackingNumber"
                                    placeholder="Enter tracking number"
                                    value={statusUpdate.tracking_number}
                                    onChange={(e) => setStatusUpdate({ ...statusUpdate, tracking_number: e.target.value })}
                                />
                            </div>
                            <div className="mb-3">
                                <CFormLabel htmlFor="notes">Notes</CFormLabel>
                                <CFormTextarea
                                    id="notes"
                                    rows="3"
                                    placeholder="Add any notes or comments"
                                    value={statusUpdate.notes}
                                    onChange={(e) => setStatusUpdate({ ...statusUpdate, notes: e.target.value })}
                                />
                            </div>
                        </div>
                    )}
                </CModalBody>
                <CModalFooter>
                    <CButton color="secondary" onClick={handleCloseModal}>
                        Cancel
                    </CButton>
                    <CButton
                        color="primary"
                        onClick={handleStatusUpdateSubmit}
                        disabled={!statusUpdate.status}
                    >
                        Update Status
                    </CButton>
                </CModalFooter>
            </CModal>
        </>
    )
}

export default Orders