import React from 'react'
import { AppContent, AppSidebar, AppFooter, AppHeader } from '../components/index'
import { useSelector } from 'react-redux'
import { Navigate } from 'react-router-dom'

const DefaultLayout = () => {
  // Get the user from the Redux store
  const user = useSelector((state) => state.UserReducer?.user)

  // Check for user and token
  if (!user || !user.token) {
    return <Navigate to="/login" replace />
  }

  return (
    <div>
      <AppSidebar />
      <div className="wrapper d-flex flex-column min-vh-100">
        <AppHeader />
        <div className="body flex-grow-1">
          <AppContent />
        </div>
        <AppFooter />
      </div>
    </div>
  )
}

export default DefaultLayout