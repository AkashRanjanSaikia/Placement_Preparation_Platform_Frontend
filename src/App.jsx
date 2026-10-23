import { Routes, Route } from 'react-router-dom'
import DashboardLayout from './layouts/DashboardLayout.jsx'
import RequireAuth from './components/RequireAuth.jsx'
import GuestOnlyRoute from './components/GuestOnlyRoute.jsx'
import Home from './pages/Home.jsx'
import ProblemSolve from './pages/DSA/ProblemSolve.jsx'
import DsaPage from './pages/DSA/DsaPage.jsx'
import AptitudePage from './pages/Aptitude/Aptitude.jsx'
import AptitudeSolve from './pages/Aptitude/AptitudeSolve.jsx'
import ContestList from './pages/Contests/ContestList.jsx'
import ContestDetail from './pages/Contests/ContestDetail.jsx'
import ContestRoom from './pages/Contests/ContestRoom.jsx'
import Leaderboard from './pages/Contests/Leaderboard.jsx'
import CreateContest from './pages/Contests/CreateContest.jsx'
import HostContestManage from './pages/Contests/HostContestManage.jsx'
import CSCorePage from './pages/CSCore/CSCore.jsx'
import CSCoreSolve from './pages/CSCore/CSCoreSolve.jsx'
import InterviewPage from './pages/Interview/Interview.jsx'
import LoginPage from './pages/Auth/Login.jsx'
import SignupPage from './pages/Auth/Signup.jsx'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route element={<GuestOnlyRoute />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
      </Route>
      <Route path="/admin/contest/create" element={<CreateContest mode="admin" />} />

      <Route element={<RequireAuth />}>
        <Route path="/dsa-practice/:slug" element={<ProblemSolve />} />
        <Route path="/aptitude/:setId" element={<AptitudeSolve />} />
        <Route path="/cs-core/:setId" element={<CSCoreSolve />} />
        <Route path="/contests/:id/room" element={<ContestRoom />} />

        <Route element={<DashboardLayout />}>
          <Route path="dsa-practice" element={<DsaPage />} />
          <Route path="cs-core" element={<CSCorePage />} />
          <Route path="interview" element={<InterviewPage />} />
          <Route path="aptitude" element={<AptitudePage />} />
          <Route path="contests" element={<ContestList />} />
          <Route path="contests/create" element={<CreateContest mode="host" />} />
          <Route path="contests/edit/:draftId" element={<CreateContest mode="host" />} />
          <Route path="contests/manage/:id" element={<HostContestManage />} />
          <Route path="contests/:id" element={<ContestDetail />} />
          <Route path="contests/:id/leaderboard" element={<Leaderboard />} />
        </Route>
      </Route>
    </Routes>
  )
}

export default App
