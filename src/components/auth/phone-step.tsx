"use client";

import { ErrorAlert } from "@/components/ui/error-alert";

const WHATSAPP_ICON = (
  <svg className="w-[52px] h-[52px]" viewBox="0 0 24 24" fill="#25D366">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
  </svg>
);

interface PhoneStepProps {
  phone: string;
  loading: boolean;
  error: string | null;
  onPhoneChange: (value: string) => void;
  onSubmit: () => void;
  primaryBtnClass: string;
}

export function PhoneStep({
  phone,
  loading,
  error,
  onPhoneChange,
  onSubmit,
  primaryBtnClass,
}: PhoneStepProps) {
  const digits = phone.replace(/\D/g, "");

  return (
    <div className="space-y-5">
      <div className="flex justify-center">{WHATSAPP_ICON}</div>

      <h2 className="text-[22px] font-bold text-[#111827] text-center">
        Entrar ou cadastrar
      </h2>
      <p className="text-[14px] text-[#6B7280] text-center -mt-2">
        Informe seu WhatsApp para continuar
      </p>

      <div>
        <label className="mb-1.5 block text-[13px] font-medium text-[#374151]">
          WhatsApp
        </label>
        <div className="flex items-center rounded-[12px] border border-[#E5E7EB] bg-white focus-within:border-[#DC2626] focus-within:ring-1 focus-within:ring-[#DC2626] transition-colors h-12">
          <span className="flex items-center pl-4 pr-3 border-r border-[#E5E7EB] h-full text-[16px] leading-none text-[#9CA3AF] gap-1.5">
            <span className="text-[18px] leading-none">🇧🇷</span>
            <span>+55</span>
          </span>
          <input
            type="tel"
            placeholder="(85) 99999-9999"
            value={phone}
            onChange={(e) => onPhoneChange(e.target.value)}
            className="flex-1 h-full bg-transparent px-3 text-[16px] leading-none text-[#111827] placeholder-[#9CA3AF] outline-none"
            autoComplete="tel"
            autoFocus
          />
          {digits.length >= 10 && (
            <span className="pr-3 text-[#25D366]">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </span>
          )}
        </div>
      </div>

      {error && <ErrorAlert message={error} />}

      <button
        type="button"
        onClick={onSubmit}
        disabled={loading || digits.length < 10}
        className={`${primaryBtnClass} gap-2`}
      >
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
        </svg>
        {loading ? "Enviando..." : "Continuar com WhatsApp"}
      </button>
    </div>
  );
}
