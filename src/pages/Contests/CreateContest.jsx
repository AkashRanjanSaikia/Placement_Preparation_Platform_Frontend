import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import AdminPasscodeGate from './components/AdminPasscodeGate.jsx'
import PublishSuccessPanel from './components/PublishSuccessPanel.jsx'
import ScheduleFields, {
  fromDatetimeLocalValue,
  toDatetimeLocalValue,
} from './components/ScheduleFields.jsx'
import SectionEditor, {
  buildSectionsApiPayload,
  countSectionQuestions,
  createEmptySection,
} from './components/SectionEditor.jsx'
import {
  createContestDraft,
  getHostContest,
  publishContest,
  updateContestDraft,
} from './api/contestApi.js'
import {
  defaultContestSchedule,
  formatLocalRange,
  isSameContestCalendarDay,
  scheduleTimezoneOffsetForApi,
} from './utils/contestDateTime.js'
import { useAuth } from '../../context/AuthProvider.jsx'

const STEPS = ['Details', 'Sections', 'Review']

export default function CreateContest({ mode = 'host' }) {
  const isHost = mode === 'host'
  const { draftId: draftIdParam } = useParams()
  const { token } = useAuth()
  const navigate = useNavigate()
  const { start, end } = defaultContestSchedule()
  const [loadingDraft, setLoadingDraft] = useState(Boolean(draftIdParam && isHost))
  const [step, setStep] = useState(0)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [rules, setRules] = useState('')
  const [visibility, setVisibility] = useState('public')
  const [startLocal, setStartLocal] = useState(toDatetimeLocalValue(start))
  const [endLocal, setEndLocal] = useState(toDatetimeLocalValue(end))
  const [maxParticipants, setMaxParticipants] = useState(undefined)
  const [sections, setSections] = useState([createEmptySection()])
  const [draftId, setDraftId] = useState('')
  const [message, setMessage] = useState('')
  const [busy, setBusy] = useState(false)
  const [publishedMeta, setPublishedMeta] = useState(null)

  useEffect(() => {
    if (!isHost || !draftIdParam || !token) return
    let cancelled = false
    setLoadingDraft(true)
    getHostContest(draftIdParam, token)
      .then((payload) => {
        if (cancelled) return
        const data = payload?.data
        if (!data?.canEdit) {
          navigate(`/contests/manage/${draftIdParam}`, { replace: true })
          return
        }
        setDraftId(draftIdParam)
        setTitle(data.title ?? '')
        setDescription(data.description ?? '')
        setRules(data.rules ?? '')
        setVisibility(data.visibility ?? 'public')
        setStartLocal(toDatetimeLocalValue(new Date(data.startTime)))
        setEndLocal(toDatetimeLocalValue(new Date(data.endTime)))
        setMaxParticipants(data.maxParticipants)
        if (data.editableSections?.length) {
          setSections(data.editableSections)
        }
      })
      .catch(() => {
        if (!cancelled) setMessage('Could not load draft')
      })
      .finally(() => {
        if (!cancelled) setLoadingDraft(false)
      })
    return () => {
      cancelled = true
    }
  }, [isHost, draftIdParam, token, navigate])

  const startIso = fromDatetimeLocalValue(startLocal)
  const endIso = fromDatetimeLocalValue(endLocal)
  const timesValid =
    startIso &&
    endIso &&
    new Date(endIso) > new Date(startIso) &&
    isSameContestCalendarDay(startIso, endIso)

  const totalQuestions = sections.reduce(
    (sum, s) => sum + countSectionQuestions(s),
    0,
  )
  const totalMarks = sections.reduce(
    (sum, s) => sum + countSectionQuestions(s) * (s.marksPerQuestion || 0),
    0,
  )

  function validateStep(current) {
    if (current === 0) {
      if (!title.trim()) {
        setMessage('Title is required')
        return false
      }
      if (!startIso || !endIso || new Date(endIso) <= new Date(startIso)) {
        setMessage('End time must be after start time')
        return false
      }
      if (!isSameContestCalendarDay(startIso, endIso)) {
        setMessage('Contest must start and end on the same calendar day')
        return false
      }
    }
    if (current === 1) {
      if (sections.some((s) => !s.name.trim())) {
        setMessage('Each section needs a name')
        return false
      }
      if (totalQuestions === 0) {
        setMessage('Add at least one question across all sections')
        return false
      }
    }
    setMessage('')
    return true
  }

  function goNext() {
    if (!validateStep(step)) return
    setStep((s) => Math.min(s + 1, STEPS.length - 1))
  }

  function goBack() {
    setMessage('')
    setStep((s) => Math.max(s - 1, 0))
  }

  function buildPayload() {
    return {
      title: title.trim(),
      description,
      rules,
      startTime: startIso,
      endTime: endIso,
      scheduleTimezoneOffset: scheduleTimezoneOffsetForApi(),
      maxParticipants,
      visibility: isHost ? visibility : 'public',
      sections: buildSectionsApiPayload(sections),
    }
  }

  async function saveDraft() {
    if (!validateStep(0) || !validateStep(1)) return
    setBusy(true)
    setMessage('')
    try {
      const payload = buildPayload()
      if (draftId) {
        await updateContestDraft(draftId, payload, mode, token)
        setMessage('Draft updated.')
      } else {
        const res = await createContestDraft(payload, mode, token)
        const id = res?.data?.contest?._id
        setDraftId(id)
        setMessage('Draft saved. Review and publish when ready.')
      }
      setStep(2)
    } catch (err) {
      setMessage(err?.response?.data?.message ?? 'Failed to save draft')
    } finally {
      setBusy(false)
    }
  }

  async function handlePublish() {
    if (!validateStep(0) || !validateStep(1)) return
    setBusy(true)
    setMessage('')
    try {
      let id = draftId
      const payload = buildPayload()
      if (id) {
        await updateContestDraft(id, payload, mode, token)
      } else {
        const res = await createContestDraft(payload, mode, token)
        id = res?.data?.contest?._id
        setDraftId(id)
      }
      if (!id) {
        setMessage('Could not save draft before publish')
        return
      }
      const pub = await publishContest(id, mode, token)
      const joinCode = pub?.data?.joinCode
      setPublishedMeta({
        contestId: id,
        visibility: isHost ? visibility : 'public',
        joinCode,
      })
      setMessage('Contest published successfully.')
    } catch (err) {
      setMessage(err?.response?.data?.message ?? 'Publish failed')
    } finally {
      setBusy(false)
    }
  }

  const formBody = (
    <div className={isHost ? '' : 'mt-6'}>
      <p className="text-ink/50 font-mono text-xs tracking-widest uppercase">
        {isHost ? '// Host' : '// Admin'}
      </p>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight">
        {isHost ? 'Host a contest' : 'Create contest'}
      </h1>
      {isHost ? (
        <p className="text-ink/60 mt-2 text-sm">
          Public contests are open to all students. Private contests require a join
          code at registration.
        </p>
      ) : null}

      <ol className="mt-6 flex flex-wrap gap-2">
        {STEPS.map((label, index) => (
          <li
            key={label}
            className={
              index === step
                ? 'bg-ink text-cream rounded-full px-4 py-1.5 text-sm dark:bg-gold dark:text-black'
                : 'border-ink/15 text-ink/60 rounded-full border px-4 py-1.5 text-sm'
            }
          >
            {index + 1}. {label}
          </li>
        ))}
      </ol>

      <div className="dashboard-panel mt-6 rounded-2xl p-6">
        {step === 0 ? (
          <div className="space-y-4">
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Contest title"
              className="border-ink/15 w-full rounded-xl border px-4 py-2.5 text-sm"
            />
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Description for students"
              rows={3}
              className="border-ink/15 w-full rounded-xl border px-4 py-2.5 text-sm"
            />
            <textarea
              value={rules}
              onChange={(e) => setRules(e.target.value)}
              placeholder="Rules (scoring, attempts, etc.)"
              rows={2}
              className="border-ink/15 w-full rounded-xl border px-4 py-2.5 text-sm"
            />
            {isHost ? (
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setVisibility('public')}
                  className={
                    visibility === 'public'
                      ? 'bg-ink text-cream rounded-full px-4 py-1.5 text-sm dark:bg-gold dark:text-black'
                      : 'border-ink/15 rounded-full border px-4 py-1.5 text-sm'
                  }
                >
                  Public
                </button>
                <button
                  type="button"
                  onClick={() => setVisibility('private')}
                  className={
                    visibility === 'private'
                      ? 'bg-ink text-cream rounded-full px-4 py-1.5 text-sm dark:bg-gold dark:text-black'
                      : 'border-ink/15 rounded-full border px-4 py-1.5 text-sm'
                  }
                >
                  Private (join code)
                </button>
              </div>
            ) : null}
            <ScheduleFields
              startLocal={startLocal}
              endLocal={endLocal}
              onStartChange={setStartLocal}
              onEndChange={setEndLocal}
              maxParticipants={maxParticipants}
              onMaxParticipantsChange={setMaxParticipants}
            />
          </div>
        ) : null}

        {step === 1 ? (
          <SectionEditor
            sections={sections}
            onChange={setSections}
            hostMode={isHost}
            token={token}
          />
        ) : null}

        {step === 2 ? (
          <div className="space-y-4 text-sm">
            <h2 className="text-lg font-semibold">{title}</h2>
            <p className="text-ink/60">{formatLocalRange(startIso, endIso)}</p>
            {isHost ? (
              <p className="capitalize">
                <span className="text-ink/50">Access:</span> {visibility}
              </p>
            ) : null}
            <p>
              <span className="text-ink/50">Sections:</span> {sections.length} ·{' '}
              <span className="text-ink/50">Questions:</span> {totalQuestions} ·{' '}
              <span className="text-ink/50">Total marks:</span> {totalMarks}
            </p>
            <ul className="space-y-2">
              {sections.map((section) => (
                <li
                  key={section.sectionKey}
                  className="border-ink/10 rounded-lg border px-3 py-2"
                >
                  <span className="font-medium">{section.name}</span>
                  <span className="text-ink/50">
                    {' '}
                    ({section.type}) — {countSectionQuestions(section)} questions ×{' '}
                    {section.marksPerQuestion} marks
                  </span>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </div>

      {!publishedMeta ? (
        <div className="mt-6 flex flex-wrap gap-2">
          {step > 0 ? (
            <button
              type="button"
              onClick={goBack}
              className="border-ink/15 rounded-full border px-5 py-2 text-sm"
            >
              Back
            </button>
          ) : null}
          {step < 2 ? (
            <button
              type="button"
              onClick={goNext}
              className="bg-ink text-cream rounded-full px-5 py-2 text-sm font-medium dark:bg-gold dark:text-black"
            >
              Continue
            </button>
          ) : null}
          {step === 2 ? (
            <>
              <button
                type="button"
                onClick={saveDraft}
                disabled={busy}
                className="border-ink/15 rounded-full border px-5 py-2 text-sm disabled:opacity-50"
              >
                {busy ? 'Saving…' : draftId ? 'Update draft' : 'Save draft'}
              </button>
              <button
                type="button"
                onClick={handlePublish}
                disabled={busy}
                className="bg-ink text-cream rounded-full px-5 py-2 text-sm font-medium disabled:opacity-50 dark:bg-gold dark:text-black"
              >
                {busy ? 'Working…' : 'Publish contest'}
              </button>
            </>
          ) : null}
        </div>
      ) : null}

      {publishedMeta ? (
        <PublishSuccessPanel
          contestId={publishedMeta.contestId}
          visibility={publishedMeta.visibility}
          joinCode={publishedMeta.joinCode}
          onDismiss={() => navigate('/contests')}
        />
      ) : null}

      {message && !publishedMeta ? (
        <p className="text-ink/60 mt-4 text-sm">{message}</p>
      ) : null}
    </div>
  )

  if (loadingDraft) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-8">
        <p className="text-ink/50 text-sm">Loading draft…</p>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <Link
        to={draftIdParam ? `/contests/manage/${draftIdParam}` : '/contests'}
        className="text-ink/50 text-sm hover:underline"
      >
        ← Back
      </Link>
      {isHost ? formBody : <AdminPasscodeGate>{formBody}</AdminPasscodeGate>}
    </div>
  )
}
