import { Routes, Route } from 'react-router-dom'
import DashboardLayout from './layouts/DashboardLayout.jsx'
import Dashboard from './pages/Dashboard.jsx'
import Home from './pages/Home.jsx'
import ServicePage from './pages/ServicePage.jsx'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/dashboard" element={<DashboardLayout />}>
        <Route index element={<Dashboard />} />
        <Route path="ai-interview" element={<ServicePage />} />
        <Route path="aptitude" element={<ServicePage />} />
        <Route path="contests" element={<ServicePage />} />
        <Route path="leaderboard" element={<ServicePage />} />
      </Route>
    </Routes>
  )
}

export default App
