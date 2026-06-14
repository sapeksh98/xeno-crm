import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './index.css'
import Navbar from './components/Navbar'
import Landing from './pages/Landing'
import Home from './pages/Home'
import Campaigns from './pages/Campaigns'
import CampaignDetail from './pages/CampaignDetail'
import Customers from './pages/Customers'
import Analytics from './pages/Analytics'

createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <Routes>
      {/* Landing page — no navbar */}
      <Route path="/" element={<Landing />} />

      {/* App pages — with navbar */}
      <Route path="/home" element={
        <div className="min-h-screen bg-gray-50">
          <Navbar />
          <main className="max-w-7xl mx-auto px-4 py-8">
            <Home />
          </main>
        </div>
      } />
      <Route path="/campaigns" element={
        <div className="min-h-screen bg-gray-50">
          <Navbar />
          <main className="max-w-7xl mx-auto px-4 py-8">
            <Campaigns />
          </main>
        </div>
      } />
      <Route path="/campaigns/:id" element={
        <div className="min-h-screen bg-gray-50">
          <Navbar />
          <main className="max-w-7xl mx-auto px-4 py-8">
            <CampaignDetail />
          </main>
        </div>
      } />
      <Route path="/customers" element={
        <div className="min-h-screen bg-gray-50">
          <Navbar />
          <main className="max-w-7xl mx-auto px-4 py-8">
            <Customers />
          </main>
        </div>
      } />
      <Route path="/analytics" element={
        <div className="min-h-screen bg-gray-50">
          <Navbar />
          <main className="max-w-7xl mx-auto px-4 py-8">
            <Analytics />
          </main>
        </div>
      } />
    </Routes>
  </BrowserRouter>
)