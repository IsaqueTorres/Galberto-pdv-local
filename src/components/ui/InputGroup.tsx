import { LucideIcon } from 'lucide-react';

type InputGroupProps = {
  label: string;
  icon?: LucideIcon; // Opcional: nem todo campo terá ícone
  value: string | number;
  onChange: (value: string | number) => void;
  type?: "text" | "number" | "password" | "email" | "date";
  placeholder?: string;
  className?: string; // Para ajustes finos de layout em cada página
}

export default function InputGroup({
  label,
  icon: Icon,
  value,
  onChange,
  type = "text",
  placeholder = "",
  className = ""
}: InputGroupProps) {
  return (
    <div className={`flex flex-col gap-1.5 group ${className}`}>
      <label className="text-xs font-bold text-zinc-500 dark:text-zinc-400 ml-1 uppercase tracking-wider">
        {label}
      </label>

      <div className="relative">
        {/* PROTEÇÃO: Só renderiza o ícone se ele for enviado */}
        {Icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-emerald-500 transition-colors">
            <Icon size={16} />
          </div>
        )}

        <input
          type={type}
          /* PADDING DINÂMICO: pl-10 se tiver ícone, px-4 se não tiver */
          className={`w-full ${Icon ? 'pl-10' : 'px-4'} pr-4 py-2.5 bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl text-sm outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all dark:text-white`}
          value={value ?? ""} // Evita erro de 'undefined' no value
          placeholder={placeholder}
          onChange={(e) => {
            const raw = e.target.value;
            // Converte para número apenas se o tipo for number
            if (type === "number") {
              onChange(raw === "" ? 0 : Number(raw));
            } else {
              onChange(raw);
            }
          }}
        />
      </div>
    </div>
  );
}