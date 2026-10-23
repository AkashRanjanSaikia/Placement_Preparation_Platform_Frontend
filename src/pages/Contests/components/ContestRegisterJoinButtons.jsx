import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { buildLoginUrl } from '../../../utils/authRedirect.js'
import { registerForContest } from '../api/contestApi.js'
import JoinCodeModal from './JoinCodeModal.jsx'

export default function ContestRegisterJoinButtons({
  contest,
  token,
  isAuthenticated,
  onUpdated,
  size = 'sm',
}) {
  const navigate = useNavigate()
  const location = useLocation()
  const [registering, setRegistering] = useState(false)
  const [joinOpen, setJoinOpen] = useState(false)
  const [joinError, setJoinError] = useState('')

  const pad = size === 'md' ? 'px-5 py-2' : 'px-4 py-1.5'
  const text = size === 'md' ? 'text-sm' : 'text-sm'

  async function doRegister(joinCode) {
    if (!contest?.id || !token) return
    setRegistering(true)
    setJoinError('')
    try {
      await registerForContest(contest.id, token, joinCode)
      setJoinOpen(false)
      onUpdated?.()
    } catch (err) {
      const msg = err?.response?.data?.message ?? 'Registration failed'
      if (joinOpen) setJoinError(msg)
    } finally {
      setRegistering(false)
    }
  }

  function handleRegisterClick() {
    if (!isAuthenticated) {
      navigate(
        buildLoginUrl(`${location.pathname}${location.search}`),
      )
      return
    }
    if (contest.requiresJoinCode) {
      setJoinError('')
      setJoinOpen(true)
      return
    }
    doRegister()
  }

  if (contest.canEnterRoom) {
    const enterLabel =
      contest.isHost && contest.status === 'upcoming'
        ? 'Preview room'
        : contest.isHost
          ? 'Enter room'
          : 'Join now'

    return (
      <Link
        to={`/contests/${contest.id}/room`}
        className={`contest-btn-enter ${pad} ${text} inline-flex shrink-0 items-center justify-center rounded-full font-medium`}
      >
        {enterLabel}
      </Link>
    )
  }

  if (contest.canRegister) {
    const registerLabel = contest.requiresJoinCode
      ? 'Register with code or token'
      : 'Register'

    return (
      <>
        <button
          type="button"
          onClick={handleRegisterClick}
          disabled={registering}
          className={`contest-btn-register ${pad} ${text} rounded-full font-medium disabled:opacity-50`}
        >
          {registering ? 'Registering…' : registerLabel}
        </button>
        <JoinCodeModal
          open={joinOpen}
          onClose={() => setJoinOpen(false)}
          onSubmit={doRegister}
          loading={registering}
          error={joinError}
        />
      </>
    )
  }

  if (contest.registered && contest.roomLocked && contest.status === 'live') {
    return (
      <span className={`text-ink/45 ${text} px-2`} title="Attempt closed">
        Attempt closed
      </span>
    )
  }

  return null
}
