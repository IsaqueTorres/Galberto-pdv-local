export function Tab({ label, ativa, onClick}: { label: string, ativa: boolean, onClick: () => void}) {
  return (
    <button
      onClick={onClick}
      className={[
        'rounded-xl px-4 py-2.5 text-sm font-medium transition-all duration-200 outline-none',
        'border',
        ativa
          ? 'border-emerald-200 bg-emerald-50 text-emerald-700 shadow-sm dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-300'
          : 'border-zinc-200 bg-white text-zinc-600 hover:border-zinc-300 hover:bg-zinc-50 hover:text-zinc-900 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400 dark:hover:border-zinc-700 dark:hover:bg-zinc-800 dark:hover:text-zinc-100',
      ].join(' ')}
    >
      {label}
    </button>
  )
}