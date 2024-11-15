import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import LoginPage from './pages/LoginPage'
import { GoogleOAuthProvider } from '@react-oauth/google'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

createRoot(document.getElementById('root')!).render(
  <GoogleOAuthProvider clientId={import.meta.env.VITE_OAUTH_CID}>
    <ToastContainer />
    <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path='/login' element={<LoginPage />}/>
      </Routes>
    </BrowserRouter>
  </StrictMode>
  </GoogleOAuthProvider>
)
