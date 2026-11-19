import { Routes, Route } from 'react-router'
import Layout from './components/layout/Layout'
import Home from './pages/Home'
import About from './pages/About'
import Services from './pages/Services'
import Operators from './pages/Operators'
import Resources from './pages/Resources'
import Regulations from './pages/Regulations'
import RegulationItem from './pages/RegulationItem'
import Connect from './pages/Connect'
import AdminDashboard from './pages/admin/Dashboard'
import MobileApp from './pages/MobileApp'
import Performance from './pages/Performance'
import { PrivacyPage, CookiesPage, AccessibilityPage, NotFoundPage } from './pages/Legal'
import SearchPage from './pages/Search'

export default function App() {
  return (
    <Routes>
      {/* Main website with Layout (Header + Footer + Chatbot) */}
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/services" element={<Services />} />
        <Route path="/operators" element={<Operators />} />
        <Route path="/resources" element={<Resources />} />
        <Route path="/resources/faq" element={<Resources />} />
        <Route path="/regulations" element={<Regulations />} />
        <Route path="/regulations/:id" element={<RegulationItem />} />
        <Route path="/connect" element={<Connect />} />
        <Route path="/performance" element={<Performance />} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="/privacy" element={<PrivacyPage />} />
        <Route path="/cookies" element={<CookiesPage />} />
        <Route path="/accessibility" element={<AccessibilityPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
      {/* Standalone routes (no Layout) */}
      <Route path="/admin" element={<AdminDashboard />} />
      <Route path="/mobile" element={<MobileApp />} />
    </Routes>
  )
}
