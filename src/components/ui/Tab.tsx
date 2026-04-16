
export function Tab({ label, ativa, onClick }: { label: string, ativa: boolean, onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`
        relative py-4 px-1 text-sm font-semibold transition-all duration-200 outline-none
        ${ativa
          ? 'text-emerald-600 dark:text-emerald-400'
          : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300'}
      `}
    >
      {label}
      {/* Indicador inferior animado */}
      {ativa && (
        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-500 rounded-full animate-in slide-in-from-left-1/2 duration-300" />
      )}
    </button>
  )
}