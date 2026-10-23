import { useEffect, useState } from 'react'
import { browseContestLibrary } from '../api/contestApi.js'
import { libraryModelForSectionType } from '../contestConstants.js'

function itemLabel(item, sectionType) {
  if (sectionType === 'DSA') {
    return `${item.title} (${item.difficulty})`
  }
  const text = item.questionText ?? ''
  return text.length > 72 ? `${text.slice(0, 72)}…` : text
}

export default function LibraryQuestionPicker({
  sectionType,
  selectedItems,
  onChangeSelected,
  hostMode = false,
  token,
}) {
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [page, setPage] = useState(1)
  const [items, setItems] = useState([])
  const [totalPages, setTotalPages] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const id = window.setTimeout(() => setDebouncedSearch(search.trim()), 300)
    return () => window.clearTimeout(id)
  }, [search])

  useEffect(() => {
    setPage(1)
  }, [debouncedSearch, sectionType])

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError('')
    browseContestLibrary(
      {
        type: sectionType,
        search: debouncedSearch || undefined,
        page,
        limit: 15,
      },
      hostMode ? 'host' : 'admin',
      token,
    )
      .then((payload) => {
        if (cancelled) return
        setItems(payload?.data ?? [])
        setTotalPages(payload?.totalPages ?? 0)
      })
      .catch(() => {
        if (!cancelled) setError('Could not load library')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [sectionType, debouncedSearch, page, hostMode, token])

  const model = libraryModelForSectionType(sectionType)
  const selectedIds = new Set(selectedItems.map((i) => i.id))

  function toggleItem(item) {
    const id = String(item.id)
    if (selectedIds.has(id)) {
      onChangeSelected(selectedItems.filter((s) => s.id !== id))
      return
    }
    onChangeSelected([
      ...selectedItems,
      {
        id,
        model,
        label: itemLabel(item, sectionType),
      },
    ])
  }

  function removeSelected(id) {
    onChangeSelected(selectedItems.filter((s) => s.id !== id))
  }

  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_220px]">
      <div>
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search library…"
          className="border-ink/15 w-full rounded-xl border px-3 py-2 text-sm"
        />
        {error ? <p className="mt-2 text-sm text-rose-600">{error}</p> : null}
        <ul className="border-ink/10 mt-3 max-h-64 space-y-1 overflow-y-auto rounded-xl border p-2">
          {loading ? (
            <li className="text-ink/50 px-2 py-3 text-sm">Loading…</li>
          ) : null}
          {!loading && items.length === 0 ? (
            <li className="text-ink/50 px-2 py-3 text-sm">No questions found.</li>
          ) : null}
          {items.map((item) => {
            const id = String(item.id)
            const checked = selectedIds.has(id)
            return (
              <li key={id}>
                <label
                  className={`flex cursor-pointer gap-2 rounded-lg px-2 py-2 text-sm ${checked ? 'bg-gold/15' : 'hover:bg-ink/5'}`}
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggleItem(item)}
                  />
                  <span>{itemLabel(item, sectionType)}</span>
                </label>
              </li>
            )
          })}
        </ul>
        {totalPages > 1 ? (
          <div className="mt-2 flex gap-2">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
              className="border-ink/15 rounded-full border px-3 py-1 text-xs disabled:opacity-40"
            >
              Prev
            </button>
            <span className="text-ink/50 self-center text-xs">
              Page {page} / {totalPages}
            </span>
            <button
              type="button"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="border-ink/15 rounded-full border px-3 py-1 text-xs disabled:opacity-40"
            >
              Next
            </button>
          </div>
        ) : null}
      </div>

      <div className="border-ink/10 rounded-xl border p-3">
        <p className="text-ink/50 font-mono text-[10px] tracking-widest uppercase">
          Selected ({selectedItems.length})
        </p>
        <ul className="mt-2 space-y-2">
          {selectedItems.length === 0 ? (
            <li className="text-ink/45 text-xs">Pick from the list</li>
          ) : null}
          {selectedItems.map((item) => (
            <li
              key={item.id}
              className="flex items-start justify-between gap-2 text-xs"
            >
              <span className="leading-snug">{item.label}</span>
              <button
                type="button"
                onClick={() => removeSelected(item.id)}
                className="text-ink/50 shrink-0 hover:text-rose-600"
                aria-label="Remove"
              >
                ×
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
