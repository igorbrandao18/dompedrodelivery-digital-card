/* eslint-disable @next/next/no-img-element */
"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useAuthStore } from "@/stores/auth";
import { ArrowLeft } from "lucide-react";

interface AuthModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

type Step = 1 | 2 | 3;

export function AuthModal({ onClose, onSuccess }: AuthModalProps) {
  const [step, setStep] = useState<Step>(1);
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState(["", "", "", ""]);
  const [name, setName] = useState("");
  const [isNewUser, setIsNewUser] = useState(false);
  const [otpToken, setOtpToken] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(0);

  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const requestOtp = useAuthStore((s) => s.requestOtp);
  const verifyOtp = useAuthStore((s) => s.verifyOtp);
  const completeRegistration = useAuthStore((s) => s.completeRegistration);

  /* ── Phone mask (99) 99999-9999 ── */
  const formatPhone = (value: string) => {
    const digits = value.replace(/\D/g, "").slice(0, 11);
    if (digits.length <= 2) return `(${digits}`;
    if (digits.length <= 7)
      return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
  };

  /* ── Countdown timer ── */
  const startCountdown = useCallback(() => {
    setCountdown(60);
    if (countdownRef.current) clearInterval(countdownRef.current);
    countdownRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          if (countdownRef.current) clearInterval(countdownRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, []);

  useEffect(() => {
    return () => {
      if (countdownRef.current) clearInterval(countdownRef.current);
    };
  }, []);

  // Escape key handler
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  /* ── Step 1: Request OTP ── */
  const handleRequestOtp = async () => {
    setError(null);
    const digits = phone.replace(/\D/g, "");
    if (digits.length < 10) {
      setError("Informe um telefone válido.");
      return;
    }
    setLoading(true);
    try {
      await requestOtp(digits);
      setStep(2);
      startCountdown();
      setTimeout(() => otpRefs.current[0]?.focus(), 100);
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : "Erro ao enviar código."
      );
    } finally {
      setLoading(false);
    }
  };

  /* ── Step 2: Verify OTP ── */
  const handleVerifyOtp = useCallback(
    async (code: string) => {
      setError(null);
      setLoading(true);
      try {
        const digits = phone.replace(/\D/g, "");
        const result = await verifyOtp(digits, code);
        if (result.isNewUser) {
          setIsNewUser(true);
          setOtpToken(result.otpToken || "");
          setStep(3);
        } else {
          onSuccess();
        }
      } catch (err: unknown) {
        setError(
          err instanceof Error ? err.message : "Código inválido."
        );
        setOtp(["", "", "", ""]);
        setTimeout(() => otpRefs.current[0]?.focus(), 100);
      } finally {
        setLoading(false);
      }
    },
    [phone, verifyOtp, onSuccess]
  );

  /* ── OTP input handlers ── */
  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const digit = value.slice(-1);
    const newOtp = [...otp];
    newOtp[index] = digit;
    setOtp(newOtp);

    if (digit && index < 3) {
      otpRefs.current[index + 1]?.focus();
    }

    // Auto-submit when all 4 digits are filled
    if (digit && index === 3) {
      const code = newOtp.join("");
      if (code.length === 4) {
        handleVerifyOtp(code);
      }
    } else if (digit && newOtp.every((d) => d !== "")) {
      const code = newOtp.join("");
      handleVerifyOtp(code);
    }
  };

  const handleOtpKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  /* ── Resend OTP ── */
  const handleResend = async () => {
    if (countdown > 0) return;
    setError(null);
    setLoading(true);
    try {
      const digits = phone.replace(/\D/g, "");
      await requestOtp(digits);
      startCountdown();
      setOtp(["", "", "", ""]);
      setTimeout(() => otpRefs.current[0]?.focus(), 100);
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : "Erro ao reenviar código."
      );
    } finally {
      setLoading(false);
    }
  };

  /* ── Step 3: Complete registration ── */
  const handleComplete = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!name.trim()) {
      setError("Informe seu nome.");
      return;
    }
    setLoading(true);
    try {
      const digits = phone.replace(/\D/g, "");
      await completeRegistration(digits, otpToken, name.trim());
      onSuccess();
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : "Erro ao criar conta. Tente novamente."
      );
    } finally {
      setLoading(false);
    }
  };

  /* ── Back button ── */
  const handleBack = () => {
    setError(null);
    if (step === 1) {
      onClose();
    } else if (step === 2) {
      setOtp(["", "", "", ""]);
      if (countdownRef.current) clearInterval(countdownRef.current);
      setStep(1);
    } else if (step === 3) {
      setStep(2);
      startCountdown();
    }
  };

  /* ── Step indicator ── */
  const totalSteps = isNewUser ? 3 : 2;
  const StepIndicator = () => (
    <div className="flex items-center justify-center gap-2 mb-6">
      {Array.from({ length: totalSteps }, (_, i) => (
        <div
          key={i}
          className={`h-2 w-2 rounded-full transition-colors ${
            i < step ? "bg-[#DC2626]" : "bg-[#E5E7EB]"
          }`}
        />
      ))}
    </div>
  );

  const inputClass =
    "w-full h-12 rounded-[12px] border border-[#E5E7EB] bg-white px-4 text-[16px] text-[#111827] placeholder-[#9CA3AF] outline-none focus:border-[#DC2626] focus:ring-1 focus:ring-[#DC2626] transition-colors";

  const primaryBtnClass =
    "flex h-12 w-full items-center justify-center rounded-[12px] bg-[#DC2626] text-[16px] font-bold text-white transition-colors hover:bg-[#B91C1C] disabled:opacity-[0.45]";

  return (
    <div className="fixed inset-0 z-[70] flex flex-col bg-[#DC2626]">
      {/* ── Top: back button ── */}
      <div className="flex items-center px-4 pt-[env(safe-area-inset-top,12px)] h-14 shrink-0">
        <button
          type="button"
          onClick={handleBack}
          className="flex h-10 w-10 items-center justify-center rounded-full text-white/80 hover:text-white hover:bg-white/10 transition-colors"
        >
          <ArrowLeft size={24} />
        </button>
      </div>

      {/* ── Logo area ── */}
      <div className="flex items-center justify-center px-6 pt-8 pb-10 shrink-0">
        <img
          src="/logo.png"
          alt="Dom Pedro Delivery"
          className="h-[56px] w-[220px] object-contain"
        />
      </div>

      {/* ── White card ── */}
      <div className="flex-1 overflow-y-auto rounded-t-[28px] bg-white shadow-[0_-4px_20px_rgba(0,0,0,0.1)]">
        <div className="mx-auto max-w-md px-6 pt-8 pb-10">
          <StepIndicator />

          {/* ── Step 1: Phone input ── */}
          {step === 1 && (
            <div className="space-y-5">
              {/* WhatsApp icon */}
              <div className="flex justify-center">
                <svg className="w-[52px] h-[52px]" viewBox="0 0 24 24" fill="#25D366">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
              </div>

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
                    onChange={(e) => setPhone(formatPhone(e.target.value))}
                    className="flex-1 h-full bg-transparent px-3 text-[16px] leading-none text-[#111827] placeholder-[#9CA3AF] outline-none"
                    autoComplete="tel"
                    autoFocus
                  />
                  {phone.replace(/\D/g, "").length >= 10 && (
                    <span className="pr-3 text-[#25D366]">
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </span>
                  )}
                </div>
              </div>

              {error && (
                <div className="flex items-center gap-2 rounded-[8px] bg-red-50 px-3 py-2">
                  <svg className="w-4 h-4 text-[#DC2626] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-[13px] text-[#DC2626]">{error}</p>
                </div>
              )}

              <button
                type="button"
                onClick={handleRequestOtp}
                disabled={loading || phone.replace(/\D/g, "").length < 10}
                className={`${primaryBtnClass} gap-2`}
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
                {loading ? "Enviando..." : "Continuar com WhatsApp"}
              </button>
            </div>
          )}

          {/* ── Step 2: OTP code ── */}
          {step === 2 && (
            <div className="space-y-5">
              {/* WhatsApp icon */}
              <div className="flex justify-center">
                <svg className="w-[52px] h-[52px]" viewBox="0 0 24 24" fill="#25D366">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
              </div>

              <h2 className="text-[22px] font-bold text-[#111827] text-center">
                Código de verificação
              </h2>
              <p className="text-[14px] text-[#6B7280] text-center -mt-2">
                Enviamos um código de 4 dígitos para
                <br />
                <span className="font-bold text-[#111827]">{phone}</span>
              </p>

              <div className="flex justify-center gap-3">
                {[0, 1, 2, 3].map((i) => (
                  <input
                    key={i}
                    ref={(el) => {
                      otpRefs.current[i] = el;
                    }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={otp[i]}
                    onChange={(e) => handleOtpChange(i, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(i, e)}
                    disabled={loading}
                    className={`h-14 w-14 rounded-[12px] border-2 bg-white text-center text-[24px] font-bold text-[#111827] outline-none transition-colors disabled:opacity-50 ${
                      otp[i]
                        ? "border-[#DC2626]"
                        : "border-[#E5E7EB] focus:border-[#DC2626] focus:ring-1 focus:ring-[#DC2626]"
                    }`}
                  />
                ))}
              </div>

              {error && (
                <div className="flex items-center gap-2 rounded-[8px] bg-red-50 px-3 py-2">
                  <svg className="w-4 h-4 text-[#DC2626] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-[13px] text-[#DC2626]">{error}</p>
                </div>
              )}

              <p className="text-center text-[13px] text-[#9CA3AF]">
                {countdown > 0 ? (
                  <span className="opacity-50">Reenviar código em {countdown}s</span>
                ) : (
                  <button
                    type="button"
                    onClick={handleResend}
                    disabled={loading}
                    className="font-medium text-[#DC2626] hover:underline"
                  >
                    Reenviar código
                  </button>
                )}
              </p>

              <button
                type="button"
                onClick={() => {
                  handleBack();
                }}
                className="w-full text-center text-[13px] text-[#6B7280] hover:text-[#111827] transition-colors"
              >
                ← Trocar número
              </button>
            </div>
          )}

          {/* ── Step 3: Name (new users only) ── */}
          {step === 3 && (
            <form onSubmit={handleComplete} className="space-y-5">
              {/* Person icon */}
              <div className="flex justify-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#DC2626]">
                  <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
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
                  onChange={(e) => setName(e.target.value)}
                  className={inputClass}
                  autoComplete="name"
                  autoFocus
                  maxLength={100}
                />
              </div>

              {error && (
                <div className="flex items-center gap-2 rounded-[8px] bg-red-50 px-3 py-2">
                  <svg className="w-4 h-4 text-[#DC2626] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-[13px] text-[#DC2626]">{error}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={loading || !name.trim()}
                className={primaryBtnClass}
              >
                {loading ? "Finalizando..." : "Finalizar"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
