import React from 'react'
import { BrowserRouter, Route, Routes } from "react-router-dom"
import Home from './pages/Home'
import useGetCurrentUser from './hooks/useGetCurrentUser'
import { useSelector } from 'react-redux'
import Dashboard from './pages/Dashboard'
import Generate from './pages/Generate'
import WebsiteEditor from './pages/Editor'
import LiveSite from './pages/LiveSite'
import Pricing from './pages/Pricing'

export const serverUrl = import.meta.env.VITE_SERVER_URL || "http://localhost:8000"

function App() {
  const { authLoading } = useGetCurrentUser()
  const { userData } = useSelector(state => state.user)

  // Show a full-screen loader while the auth check is in flight.
  // This prevents a flash where protected routes briefly redirect to Home.
  if (authLoading) {
    return (
      <div className='h-screen w-screen flex items-center justify-center bg-[#040404]'>
        <div className='flex flex-col items-center gap-4'>
          <div className='w-8 h-8 rounded-full border-2 border-white/20 border-t-white animate-spin' />
          <span className='text-xs text-zinc-500 tracking-widest uppercase'>SiteForge AI</span>
        </div>
      </div>
    )
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path='/' element={<Home />} />
        <Route path='/dashboard' element={userData ? <Dashboard /> : <Home />} />
        <Route path='/generate' element={userData ? <Generate /> : <Home />} />
        <Route path='/editor/:id' element={userData ? <WebsiteEditor /> : <Home />} />
        <Route path='/site/:id' element={<LiveSite />} />
        <Route path='/pricing' element={<Pricing />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
