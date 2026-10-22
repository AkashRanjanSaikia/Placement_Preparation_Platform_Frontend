import { Routes, Route } from 'react-router-dom'
import DashboardLayout from './layouts/DashboardLayout.jsx'
import Home from './pages/Home.jsx'
import ProblemSolve from './pages/DSA/ProblemSolve.jsx'
import DsaPage from './pages/DSA/DsaPage.jsx'
import AptitudePage from './pages/Aptitude/Aptitude.jsx'
import AptitudeSolve from './pages/Aptitude/AptitudeSolve.jsx'
import ContestsPage from './pages/Contests/Contests.jsx'
import CSCorePage from './pages/CSCore/CSCore.jsx'
import CSCoreSolve from './pages/CSCore/CSCoreSolve.jsx'
import InterviewPage from './pages/Interview/Interview.jsx'
import LoginPage from './pages/Auth/Login.jsx'
import SignupPage from './pages/Auth/Signup.jsx'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route path="/dsa-practice/:slug" element={<ProblemSolve />} />
      <Route path="/aptitude/:setId" element={<AptitudeSolve />} />
      <Route path="/cs-core/:setId" element={<CSCoreSolve />} />

      <Route element={<DashboardLayout />}>
        {/* <Route index element={<UserProfile />} />  yet to implement */}
        <Route path="dsa-practice" element={<DsaPage />} />
        <Route path="cs-core" element={<CSCorePage />} />
        <Route path="interview" element={<InterviewPage />} />
        <Route path="aptitude" element={<AptitudePage />} />
        <Route path="contests" element={<ContestsPage />} />
      </Route>
    </Routes>
  )
}

export default App
