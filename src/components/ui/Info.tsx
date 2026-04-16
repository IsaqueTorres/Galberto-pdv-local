interface Info {
  label: string;
  value: string;
}

export default function Info({ label, value }: Info) {
  return (
    <div className="flex justify-between gap-4">
      <span className="text-gray-500">{label}</span>
      <span className="text-gray-900 dark:text-gray-200 font-medium text-right">
        {value}
      </span>
    </div>
  )
}