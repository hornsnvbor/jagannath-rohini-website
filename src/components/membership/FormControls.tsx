import { type ReactNode, type ChangeEvent } from 'react';

export const inputBase =
  'w-full pl-12 pr-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none transition';

export function inputClass(hasError?: boolean): string {
  return `${inputBase} ${hasError ? 'border-red-500' : 'border-gray-300'}`;
}

export function SectionTitle({ children }: { children: ReactNode }) {
  return (
    <h3 className="text-lg font-semibold text-primary border-b-2 border-primary/20 pb-2 pt-2">
      {children}
    </h3>
  );
}

export function IconTextInput({
  label,
  required,
  error,
  icon,
  type = 'text',
  placeholder,
  value,
  onChange,
  className,
  extraClass = '',
  asTextarea = false,
}: {
  label: string;
  required?: boolean;
  error?: string;
  icon: string;
  type?: string;
  placeholder: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  className: string;
  extraClass?: string;
  asTextarea?: boolean;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <div className="relative">
        <icon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        {asTextarea ? (
          <textarea
            value={value}
            onChange={onChange}
            className={`${inputBase} ${extraClass} ${className}`}
            placeholder={placeholder}
          />
        ) : (
          <input
            type={type}
            value={value}
            onChange={onChange}
            className={`${inputBase} ${extraClass} ${className}`}
            placeholder={placeholder}
          />
        )}
      </div>
      {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
    </div>
  );
}

interface FieldProps {
  label: string;
  required?: boolean;
  error?: string;
  children: ReactNode;
  hint?: string;
}

export function Field({ label, required, error, children, hint }: FieldProps) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {children}
      {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
      {hint && !error && <p className="text-xs text-gray-400 mt-1">{hint}</p>}
    </div>
  );
}

interface FileInputProps {
  label: string;
  required?: boolean;
  value: File | null;
  onChange: (file: File | null) => void;
  accept: string;
  multiple?: never;
}

export function FileInput({ label, required, value, onChange, accept }: FileInputProps) {
  const handle = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    onChange(file);
  };
  return (
    <div>
      <input
        type="file"
        aria-label={label}
        aria-required={required}
        accept={accept}
        onChange={handle}
        className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-white hover:file:bg-primary-dark transition"
      />
      {value && <p className="text-xs text-green-600 mt-1">Selected: {value.name}</p>}
    </div>
  );
}