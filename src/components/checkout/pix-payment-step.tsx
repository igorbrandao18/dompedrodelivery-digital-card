"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { apiFetch } from "@/lib/api";
import { Loader2, Copy, Check, QrCode, RefreshCw } from "lucide-react";
import { PrimaryButton } from "@/components/ui/primary-button";

interface PixPaymentResponse {
  payment_id: string;
  status: string;
  qr_code: string;
  qr_code_base64: string;
  ticket_url: string;
  expires_at: string;
}

interface PixStatusResponse {
  status: string;
}

interface PixPaymentStepProps {
  orderId: string;
  onSuccess: () => void;
}

const POLL_INTERVAL_MS = 5_000;

export function PixPaymentStep({ orderId, onSuccess }: PixPaymentStepProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pixData, setPixData] = useState<PixPaymentResponse | null>(null);
  const [copied, setCopied] = useState(false);
  const [checking, setChecking] = useState(false);
  const [timeLeft, setTimeLeft] = useState<number>(0);

  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const paymentIdRef = useRef<string | null>(null);

  // Cleanup all intervals
  const cleanup = useCallback(() => {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  // Check payment status
  const checkStatus = useCallback(async () => {
    if (!paymentIdRef.current) return;
    try {
      const res = await apiFetch<PixStatusResponse>(
        `/payments/${paymentIdRef.current}/status/`
      );
      if (res.status === "approved") {
        cleanup();
        onSuccess();
      }
    } catch {
      // Silently ignore polling errors
    }
  }, [cleanup, onSuccess]);

  // Create PIX payment on mount
  useEffect(() => {
    let cancelled = false;

    async function createPixPayment() {
      setLoading(true);
      setError(null);
      try {
        const data = await apiFetch<PixPaymentResponse>("/payments/pix/", {
          method: "POST",
          body: JSON.stringify({ order_id: orderId }),
        });
        if (cancelled) return;

        setPixData(data);
        paymentIdRef.current = data.payment_id;

        // Start countdown timer
        const expiresAt = new Date(data.expires_at).getTime();
        const now = Date.now();
        setTimeLeft(Math.max(0, Math.floor((expiresAt - now) / 1000)));

        timerRef.current = setInterval(() => {
          const remaining = Math.max(
            0,
            Math.floor((expiresAt - Date.now()) / 1000)
          );
          setTimeLeft(remaining);
          if (remaining <= 0 && timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
          }
        }, 1000);

        // Start polling for payment status
        pollRef.current = setInterval(() => {
          checkStatus();
        }, POLL_INTERVAL_MS);

        setLoading(false);
      } catch (err) {
        if (cancelled) return;
        setError(
          err instanceof Error ? err.message : "Erro ao gerar pagamento PIX"
        );
        setLoading(false);
      }
    }

    createPixPayment();

    return () => {
      cancelled = true;
      cleanup();
    };
  }, [orderId, checkStatus, cleanup]);

  // Handle copy to clipboard
  const handleCopy = async () => {
    if (!pixData?.qr_code) return;
    try {
      await navigator.clipboard.writeText(pixData.qr_code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for older browsers
      const textarea = document.createElement("textarea");
      textarea.value = pixData.qr_code;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Handle manual status check
  const handleManualCheck = async () => {
    setChecking(true);
    await checkStatus();
    setChecking(false);
  };

  // Format time remaining
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-full py-20">
        <Loader2 size={48} className="animate-spin text-[#DC2626] mb-4" />
        <p className="text-[16px] font-bold text-[#111827]">
          Gerando QR Code PIX...
        </p>
        <p className="text-[14px] text-[#6B7280] mt-1">Aguarde um momento</p>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full py-20 px-6">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-red-100 mb-5">
          <QrCode size={44} className="text-[#DC2626]" />
        </div>
        <h2 className="text-[18px] font-bold text-[#111827] mb-2">
          Erro ao gerar PIX
        </h2>
        <p className="text-[14px] text-[#6B7280] text-center mb-6">{error}</p>
      </div>
    );
  }

  // Expired state
  if (timeLeft <= 0 && pixData) {
    return (
      <div className="flex flex-col items-center justify-center h-full py-20 px-6">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#FEF2F2] mb-5">
          <QrCode size={44} className="text-[#DC2626]" />
        </div>
        <h2 className="text-[18px] font-bold text-[#111827] mb-2">
          QR Code expirado
        </h2>
        <p className="text-[14px] text-[#6B7280] text-center mb-6">
          O tempo para pagamento expirou.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center px-6 py-6">
      {/* Instruction */}
      <div className="flex items-center gap-2 mb-5">
        <QrCode size={20} className="text-[#6B7280]" />
        <p className="text-[14px] text-[#6B7280]">
          Escaneie o QR Code com seu app de banco
        </p>
      </div>

      {/* QR Code image */}
      {pixData?.qr_code_base64 && (
        <div className="bg-white rounded-2xl border-2 border-[#E5E7EB] p-4 mb-5">
          <img
            src={`data:image/png;base64,${pixData.qr_code_base64}`}
            alt="QR Code PIX"
            className="w-[220px] h-[220px]"
          />
        </div>
      )}

      {/* Timer */}
      <p className="text-[13px] text-[#9CA3AF] mb-5">
        Expira em{" "}
        <span className="font-semibold text-[#6B7280]">
          {formatTime(timeLeft)}
        </span>
      </p>

      {/* Copy-paste code */}
      <div className="w-full mb-5">
        <p className="text-[12px] font-bold text-[#6B7280] uppercase tracking-wider mb-2">
          Ou copie o codigo PIX
        </p>
        <div className="flex items-center gap-2 w-full rounded-[12px] bg-[#F9FAFB] border border-[#E5E7EB] p-3">
          <p className="flex-1 text-[13px] font-mono text-[#374151] break-all line-clamp-2 select-all">
            {pixData?.qr_code}
          </p>
          <button
            type="button"
            onClick={handleCopy}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[10px] bg-[#DC2626] text-white hover:bg-[#B91C1C] transition-colors"
          >
            {copied ? <Check size={18} /> : <Copy size={18} />}
          </button>
        </div>
        {copied && (
          <p className="text-[12px] text-[#22C55E] font-medium mt-1.5">
            Codigo copiado!
          </p>
        )}
      </div>

      {/* Manual check button */}
      <PrimaryButton onClick={handleManualCheck} loading={checking}>
        <span className="flex items-center gap-2">
          <RefreshCw size={16} className={checking ? "animate-spin" : ""} />
          Ja paguei
        </span>
      </PrimaryButton>

      {/* Subtle info */}
      <p className="text-[12px] text-[#9CA3AF] text-center mt-4 px-4">
        O pagamento sera confirmado automaticamente apos a transferencia
      </p>
    </div>
  );
}
