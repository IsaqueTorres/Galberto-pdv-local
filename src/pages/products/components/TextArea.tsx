export function TextArea({ label, value, onChange, hint }: { label: string; value: string; onChange: (value: string) => void; hint?: string }) {
  return (
    <label className="relative flex flex-col gap-1 text-sm font-bold text-blue-900 md:col-span-1">
      <div className="flex items-center gap-2">
        <span>{label}</span>
        {hint ? (
          <span className="group relative inline-flex h-5 w-5 cursor-help items-center justify-center rounded-full bg-blue-100 text-[10px] font-bold text-blue-700" aria-label={hint}>
            ?
            <span className="pointer-events-none absolute left-1/2 top-full z-20 hidden w-64 -translate-x-1/2 rounded-2xl border border-blue-100 bg-white p-3 text-xs font-normal text-blue-900 shadow-lg group-hover:block">
              {hint}
            </span>
          </span>
        ) : null}
      </div>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={3}
        className="resize-none rounded-lg border border-blue-100 px-3 py-2 font-medium outline-none focus:border-blue-500"
      />
    </label>
  );
}