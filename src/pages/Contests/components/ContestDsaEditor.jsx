import { memo } from 'react'
import Editor from '@monaco-editor/react'
import { CONTEST_LANGUAGES } from '../contestConstants.js'

function monacoFromKey(key) {
  return CONTEST_LANGUAGES.find((l) => l.id === key)?.monaco ?? 'python'
}

function ContestDsaEditor({
  mountKey,
  initialCode,
  languageKey,
  theme,
  readOnly,
  onDraftChange,
}) {
  return (
    <Editor
      key={mountKey}
      height="320px"
      language={monacoFromKey(languageKey)}
      theme={theme === 'dark' ? 'vs-dark' : 'light'}
      defaultValue={initialCode}
      onChange={(value) => onDraftChange(value ?? '')}
      options={{
        minimap: { enabled: false },
        fontSize: 13,
        scrollBeyondLastLine: false,
        readOnly,
        automaticLayout: true,
      }}
    />
  )
}

export default memo(ContestDsaEditor)
