import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import LoginPage from './pages/LoginPage'
import { GoogleOAuthProvider } from '@react-oauth/google'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import ProtectedRoute from './components/ProtectedRoute'
import Layout from './layouts/Layout'
import Home from './components/Home'
import NotFound from './components/NotFound'

createRoot(document.getElementById('root')!).render(
  <GoogleOAuthProvider clientId={import.meta.env.VITE_OAUTH_CID}>
    <ToastContainer />
    <StrictMode>
      <BrowserRouter>
        <Routes>
          <Route path='/' element={<ProtectedRoute><Layout /></ProtectedRoute>}>
            <Route path='/' element={<Home />}>
              <Route path="dashboard" />
              <Route path="profile" />
              <Route path="bids" />
              <Route path="winning" />
              <Route path="reviews" />
            </Route>
          </Route>
          <Route path='/login' element={<LoginPage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </StrictMode>
  </GoogleOAuthProvider>
)
