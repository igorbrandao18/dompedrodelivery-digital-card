"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useAuthStore } from "@/stores/auth";

type Step = 1 | 2 | 3;

export function useAuthFlow(onClose: () => void, onSuccess: () => void) {
  const [step, setStep] = useState<Step>(1);
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
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

  const fmtPhone = (v: string) => {
    const d = v.replace(/\D/g, "").slice(0, 11);
    if (d.length <= 2) return `(${d}`;
    if (d.length <= 7) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
    return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
  };

  const startCountdown = useCallback(() => {
    setCountdown(60);
    if (countdownRef.current) clearInterval(countdownRef.current);
    countdownRef.current = setInterval(() => {
      setCountdown((p) => {
        if (p <= 1) { clearInterval(countdownRef.current!); return 0; }
        return p - 1;
      });
    }, 1000);
  }, []);

  useEffect(() => () => { if (countdownRef.current) clearInterval(countdownRef.current); }, []);

  const handleRequestOtp = async () => {
    setError(null);
    const digits = phone.replace(/\D/g, "");
    if (digits.length < 10) { setError("Informe um telefone válido."); return; }
    setLoading(true);
    try {
      await requestOtp(digits);
      setStep(2);
      startCountdown();
      setTimeout(() => otpRefs.current[0]?.focus(), 100);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Erro ao enviar código.");
    } finally {
      setLoading(false);
    }
  };

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
        setError(err instanceof Error ? err.message : "Código inválido.");
        setOtp(["", "", "", "", "", ""]);
        setTimeout(() => otpRefs.current[0]?.focus(), 100);
      } finally {
        setLoading(false);
      }
    },
    [phone, verifyOtp, onSuccess]
  );

  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const digit = value.slice(-1);
    const next = [...otp]; next[index] = digit; setOtp(next);
    if (digit && index < 5) otpRefs.current[index + 1]?.focus();
    const filled = digit && next.every((d) => d !== "");
    if ((digit && index === 5 && next.join("").length === 6) || filled) handleVerifyOtp(next.join(""));
  };

  const handleOtpKeyDown = (i: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otp[i] && i > 0) otpRefs.current[i - 1]?.focus();
  };

  const handleResend = async () => {
    if (countdown > 0) return;
    setError(null); setLoading(true);
    try { await requestOtp(phone.replace(/\D/g, "")); startCountdown(); setOtp(["", "", "", "", "", ""]); setTimeout(() => otpRefs.current[0]?.focus(), 100); }
    catch (err: unknown) { setError(err instanceof Error ? err.message : "Erro ao reenviar código."); }
    finally { setLoading(false); }
  };

  const handleComplete = async (e: React.FormEvent) => {
    e.preventDefault(); setError(null);
    if (!name.trim()) { setError("Informe seu nome."); return; }
    setLoading(true);
    try { await completeRegistration(phone.replace(/\D/g, ""), otpToken, name.trim()); onSuccess(); }
    catch (err: unknown) { setError(err instanceof Error ? err.message : "Erro ao criar conta. Tente novamente."); }
    finally { setLoading(false); }
  };

  const handleBack = () => {
    setError(null);
    if (step === 1) onClose();
    else if (step === 2) { setOtp(["", "", "", "", "", ""]); if (countdownRef.current) clearInterval(countdownRef.current); setStep(1); }
    else if (step === 3) { setStep(2); startCountdown(); }
  };

  return {
    step, phone, otp, name, isNewUser, loading, error, countdown,
    otpRefs,
    setPhone: (v: string) => setPhone(fmtPhone(v)),
    setName,
    handleRequestOtp,
    handleOtpChange,
    handleOtpKeyDown,
    handleResend,
    handleComplete,
    handleBack,
  };
}
