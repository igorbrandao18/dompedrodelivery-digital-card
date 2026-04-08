"use client";

import { ErrorAlert } from "@/components/ui/error-alert";

interface NameStepProps {
  name: string;
  loading: boolean;
  error: string | null;
  onNameChange: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  inputClass: string;
  primaryBtnClass: string;
}

export function NameStep({
  name,
  loading,
  error,
  onNameChange,
  onSubmit,
  inputClass,
  primaryBtnClass,
}: NameStepProps) {
  return (
    <form onSubmit={onSubmit} className="space-y-5">
      {/* Person icon */}
      <div className="flex justify-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#DC2626]">
          <svg
            className="w-8 h-8 text-white"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
            />
          </svg>
        </div>
      </div>

      <h2 className="text-[22px] font-bold text-[#111827] text-center">
        Como podemos te chamar?
      </h2>
      <p className="text-[14px] text-[#6B7280] text-center -mt-2">
        Último passo para criar sua conta
      </p>

      <div>
        <label className="mb-1.5 block text-[13px] font-medium text-[#374151]">
          Nome
        </label>
        <input
          type="text"
          placeholder="Seu nome"
          value={name}
          onChange={(e) => onNameChange(e.target.value)}
          className={inputClass}
          autoComplete="name"
          autoFocus
          maxLength={100}
        />
      </div>

      {error && <ErrorAlert message={error} />}

      <button
        type="submit"
        disabled={loading || !name.trim()}
        className={primaryBtnClass}
      >
        {loading ? "Finalizando..." : "Finalizar"}
      </button>
    </form>
  );
}
