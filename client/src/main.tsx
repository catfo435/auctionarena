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
import Home from './pages/Home'
import NotFound from './components/NotFound'
import AboutUsPage from './pages/AboutUs'
import Dashboard from './components/Dashboard'
import Reviews from './components/Reviews'
import AuctionsWon from './components/AuctionsWon'
import Bids from './components/Bids'
import Profile from './components/Profile'
import AuctionsPage from './pages/Auctions'
import ArtworksPage from './pages/Artworks'

createRoot(document.getElementById('root')!).render(
  <GoogleOAuthProvider clientId={import.meta.env.VITE_OAUTH_CID}>
    <ToastContainer />
    <StrictMode>
      <BrowserRouter>
        <Routes>
          <Route path='/' element={<ProtectedRoute><Layout /></ProtectedRoute>}>
            <Route path='/' element={<Home />}>
              <Route path="dashboard" element={<Dashboard />}/>
              <Route path="profile" element={<Profile />}/>
              <Route path="bids" element={<Bids />}/>
              <Route path="auctionswon" element={<AuctionsWon />}/>
              <Route path="reviews" element={<Reviews />} />
            </Route>
            <Route path='/about' element={<AboutUsPage />} />
            <Route path='/auctions' element={<AuctionsPage />} />
            <Route path='/artworks' element={<ArtworksPage />} />
          </Route>
          <Route path='/login' element={<LoginPage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </StrictMode>
  </GoogleOAuthProvider>
)
