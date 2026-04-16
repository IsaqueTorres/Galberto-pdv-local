export default function BooleanInfo({ label, value }: { label: string; value: boolean }) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-gray-500">{label}</span>
      <span className={`text-xs font-semibold px-2 py-1 rounded-full
        ${value
          ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
          : 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
        }
      `}>
        {value ? 'Sim' : 'Não'}
      </span>
    </div>
  )
}