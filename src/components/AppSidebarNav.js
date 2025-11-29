import React, { useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import PropTypes from 'prop-types'

import SimpleBar from 'simplebar-react'
import 'simplebar-react/dist/simplebar.min.css'

import { CBadge, CNavLink, CSidebarNav } from '@coreui/react'

// Custom NavGroup to handle open/close state
const CustomNavGroup = ({ children, toggler, defaultOpen, ...rest }) => {
  const [visible, setVisible] = useState(defaultOpen)

  return (
    <div className={`nav-group ${visible ? 'show' : ''}`} {...rest}>
      <a
        className="nav-link nav-group-toggle"
        href="#"
        onClick={(e) => {
          e.preventDefault()
          setVisible(!visible)
        }}
      >
        {toggler}
      </a>
      <ul className="nav-group-items">{children}</ul>
    </div>
  )
}

CustomNavGroup.propTypes = {
  children: PropTypes.node,
  toggler: PropTypes.node,
  defaultOpen: PropTypes.bool,
}

export const AppSidebarNav = ({ items }) => {
  const location = useLocation()

  const navLink = (name, icon, badge, indent = false) => {
    return (
      <>
        {icon ? (
          icon
        ) : (
          indent && (
            <span className="nav-icon">
              <span className="nav-icon-bullet"></span>
            </span>
          )
        )}
        {name && name}
        {badge && (
          <CBadge color={badge.color} className="ms-auto" size="sm">
            {badge.text}
          </CBadge>
        )}
      </>
    )
  }

  const navItem = (item, index, indent = false) => {
    const { component, name, badge, icon, allowedRoles, ...rest } = item
    const Component = component
    return (
      <Component as="div" key={index}>
        {rest.to || rest.href ? (
          <CNavLink
            {...(rest.to && { as: NavLink })}
            {...(rest.href && { target: '_blank', rel: 'noopener noreferrer' })}
            {...rest}
          >
            {navLink(name, icon, badge, indent)}
          </CNavLink>
        ) : (
          navLink(name, icon, badge, indent)
        )}
      </Component>
    )
  }

  // Function to check if any item in the group is active
  const isGroupActive = (items) => {
    return items?.some((item) => {
      if (item.items) return isGroupActive(item.items)
      return item.to && location.pathname.startsWith(item.to)
    })
  }

  const navGroup = (item, index) => {
    const { component, name, icon, items, to, allowedRoles, ...rest } = item

    const isOpen = isGroupActive(items) // Open if any child is active

    const Component = component
    return (
      <CustomNavGroup
        key={index}
        toggler={navLink(name, icon)}
        defaultOpen={isOpen}
        {...rest}
      >
        {items?.map((item, index) =>
          item.items ? navGroup(item, index) : navItem(item, index, true),
        )}
      </CustomNavGroup>
    )
  }

  return (
    <CSidebarNav as={SimpleBar}>
      {items &&
        items.map((item, index) => (item.items ? navGroup(item, index) : navItem(item, index)))}
    </CSidebarNav>
  )
}

AppSidebarNav.propTypes = {
  items: PropTypes.arrayOf(PropTypes.any).isRequired,
}
