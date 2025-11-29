import React, { useMemo } from 'react'
import { useSelector, useDispatch } from 'react-redux'

import {
  CCloseButton,
  CSidebar,
  CSidebarBrand,
  CSidebarFooter,
  CSidebarHeader,
  CSidebarToggler,
  CNavGroup,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'

import { AppSidebarNav } from './AppSidebarNav'

import { logo } from 'src/assets/brand/logo'
import { sygnet } from 'src/assets/brand/sygnet'

// sidebar nav config
import navigation from '../_nav'
import Config from 'src/config/Config'

const AppSidebar = () => {
  const dispatch = useDispatch()
  const unfoldable = useSelector((state) => state.ui.sidebarUnfoldable)
  const sidebarShow = useSelector((state) => state.ui.sidebarShow)
  const user = useSelector((state) => state.UserReducer?.user)

  // useMemo to filter navigation based on user role
  const filteredNavigation = useMemo(() => {
    if (!user || !user.role) {
      return [] // No user, no nav
    }

    const role = user.role
    const allowedNav = []

    // navigation.forEach((navItem) => {
    //   // Dashboard for all 
    //   if (navItem.to === '/dashboard') {
    //     allowedNav.push(navItem)
    //     return
    //   }
    navigation.forEach((navItem) => {
      if (role === Config.userType.SELLER) {
        // If navItem has allowedRoles and includes SELLER
        if (navItem.allowedRoles && navItem.allowedRoles.includes(Config.userType.SELLER)) {
          allowedNav.push(navItem)
          return
        }
      } else if (role === Config.userType.ADMIN) {
        // If navItem has allowedRoles and includes ADMIN
        if (navItem.allowedRoles && navItem.allowedRoles.includes(Config.userType.ADMIN)) {
          allowedNav.push(navItem)
          return
        }
      }

      // Management Group
      if (navItem.component === CNavGroup && navItem.name === 'Management') {
        let accessibleItems = []
        if (role === Config.userType.SELLER) {
          accessibleItems = navItem.items.filter(
            (item) =>
              item.to === '/management/products' ||
              item.to === '/management/orders' ||
              item.to === '/management/profit' ||
              item.to === '/management/revenue' ||
              item.to === '/management/contact'
          )
        } else if (role === Config.userType.ADMIN) {
          accessibleItems = navItem.items.filter(
            (item) =>
              item.to === '/management/products' ||
              item.to === '/management/orders' ||
              item.to === '/management/profit' ||
              item.to === '/management/revenue' ||
              item.to === '/management/contact' ||
              item.to === '/management/all-sellers' ||
              item.to === '/management/returns&refunds',
          )
        }

        if (accessibleItems.length > 0) {
          allowedNav.push({ ...navItem, items: accessibleItems })
        }
        return
      }

      // UI Management Group
      if (navItem.component === CNavGroup && navItem.name === 'UI Management') {
        if (role === Config.userType.ADMIN) {
          allowedNav.push(navItem) // Admin gets all items
        }
        return
      }
    })

    return allowedNav
  }, [user]) // Recompute if user changes

  return (
    <CSidebar
      className="border-end"
      colorScheme="dark"
      position="fixed"
      unfoldable={unfoldable}
      visible={sidebarShow}
      onVisibleChange={(visible) => {
        dispatch({ type: 'set', sidebarShow: visible })
      }}
    >
      <CSidebarHeader className="border-bottom">
        <CSidebarBrand to="/">
          {/* <CIcon customClassName="sidebar-brand-full" icon={logo} height={32} /> */}
          <span>harsh logo</span>
          <CIcon customClassName="sidebar-brand-narrow" icon={sygnet} height={32} />
        </CSidebarBrand>
        <CCloseButton
          className="d-lg-none"
          dark
          onClick={() => dispatch({ type: 'set', sidebarShow: false })}
        />
      </CSidebarHeader>
      {/* Use the filtered navigation items */}
      <AppSidebarNav items={filteredNavigation} />
      <CSidebarFooter className="border-top d-none d-lg-flex">
        <CSidebarToggler
          onClick={() => dispatch({ type: 'set', sidebarUnfoldable: !unfoldable })}
        />
      </CSidebarFooter>
    </CSidebar>
  )
}

export default React.memo(AppSidebar)