export function Tab({ label, ativa, onClick}: { label: string, ativa: boolean, onClick: () => void}) {
  return (
    <button
      onClick={onClick}
      className={[
        'rounded-xl px-4 py-2.5 text-sm font-medium transition-all duration-200 outline-none',
        'border',
        ativa
          ? 'border-blue-200 bg-blue-600 text-white shadow-sm'
          : 'border-blue-100 bg-blue-50 text-blue-800 hover:border-blue-300 hover:bg-blue-100 hover:text-blue-950',
      ].join(' ')}
    >
      {label}
    </button>
  )
}
