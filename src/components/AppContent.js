import React, { Suspense } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { CContainer, CSpinner } from '@coreui/react'
import { useSelector } from 'react-redux'
import Config from '../config/Config'

// routes config
import routes from '../routes'

const ProtectedElement = ({ element, allowedRoles }) => {
  const user = useSelector((state) => state.UserReducer?.user)

  if (!user || !user.role) {
    return <Navigate to="/login" replace />
  }

  if (!allowedRoles || allowedRoles.length === 0) {
    // No specific roles required, allow access
    return element
  }

  if (!allowedRoles.includes(user.role)) {
    // Role not allowed, redirect to dashboard
    return <Navigate to="/dashboard" replace />
  }
  return element // Role allowed, render the element
}

const AppContent = () => {
  return (
    <CContainer className="px-4" lg>
      <Suspense fallback={<CSpinner color="primary" />}>
        <Routes>
          {routes.map((route, idx) => {
            return (
              route.element && (
                <Route
                  key={idx}
                  path={route.path}
                  exact={route.exact}
                  name={route.name}
                  // element={<route.element />}
                  element={
                    <ProtectedElement element={<route.element />} allowedRoles={route.allowedRoles} />
                  }
                />
              )
            )
          })}
          <Route path="/" element={<Navigate to="dashboard" replace />} />
        </Routes>
      </Suspense>
    </CContainer>
  )
}

export default React.memo(AppContent)
