export default function ContestDsaExample({ example, index }) {
  const { input, output, explanation } = example ?? {}

  return (
    <div className="border-ink/10 bg-ink/4 dark:border-white/10 dark:bg-white/5 mt-2 rounded-xl border p-3">
      <p className="text-ink/50 font-mono text-[11px] tracking-widest uppercase">
        Example {index + 1}
      </p>
      {input ? (
        <p className="mt-2 font-mono text-xs whitespace-pre-wrap">
          <span className="text-ink/50">Input: </span>
          {typeof input === 'string' ? input : JSON.stringify(input)}
        </p>
      ) : null}
      {output ? (
        <p className="mt-1 font-mono text-xs whitespace-pre-wrap">
          <span className="text-ink/50">Output: </span>
          {typeof output === 'string' ? output : JSON.stringify(output)}
        </p>
      ) : null}
      {explanation ? (
        <p className="text-ink/70 mt-2 text-xs leading-relaxed">{explanation}</p>
      ) : null}
    </div>
  )
}
