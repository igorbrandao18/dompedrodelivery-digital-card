"use client";

import { useState } from "react";
import { useAuthStore } from "@/stores/auth";
import { X } from "lucide-react";

interface AuthModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

type Mode = "login" | "register";

export function AuthModal({ onClose, onSuccess }: AuthModalProps) {
  const [mode, setMode] = useState<Mode>("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const login = useAuthStore((s) => s.login);
  const register = useAuthStore((s) => s.register);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      if (mode === "login") {
        await login(email, password);
      } else {
        await register(name, email, password, phone);
      }
      onSuccess();
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Erro ao processar. Tente novamente.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setMode(mode === "login" ? "register" : "login");
    setError(null);
  };

  const inputClass =
    "w-full h-12 rounded-[12px] border border-[#E5E7EB] bg-white px-4 text-[14px] text-[#111827] placeholder-[#9CA3AF] outline-none focus:border-[#DC2626] focus:ring-1 focus:ring-[#DC2626] transition-colors";

  return (
    <>
      {/* Scrim */}
      <div
        className="fixed inset-0 z-[60] bg-black/40"
        onClick={onClose}
      />

      {/* Bottom sheet */}
      <div className="fixed inset-x-0 bottom-0 z-[61] flex justify-center animate-in slide-in-from-bottom duration-300">
        <div className="w-full max-w-2xl rounded-t-[16px] bg-white shadow-xl">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-[#E5E7EB] px-4 py-3">
            <h2 className="text-[18px] font-bold text-[#111827]">
              {mode === "login" ? "Entrar" : "Criar conta"}
            </h2>
            <button
              type="button"
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-[#F3F4F6] transition-colors"
            >
              <X size={20} className="text-[#6B7280]" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-3 p-4">
            {mode === "register" && (
              <input
                type="text"
                placeholder="Nome completo"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className={inputClass}
              />
            )}

            <input
              type="email"
              placeholder="E-mail"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className={inputClass}
            />

            <input
              type="password"
              placeholder="Senha"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className={inputClass}
            />

            {mode === "register" && (
              <input
                type="tel"
                placeholder="Telefone (WhatsApp)"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
                className={inputClass}
              />
            )}

            {/* Error */}
            {error && (
              <p className="rounded-[8px] bg-red-50 px-3 py-2 text-[13px] text-[#DC2626]">
                {error}
              </p>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="flex h-12 w-full items-center justify-center rounded-[12px] bg-[#DC2626] text-[16px] font-bold text-white transition-colors hover:bg-[#B91C1C] disabled:opacity-60"
            >
              {loading
                ? "Aguarde..."
                : mode === "login"
                  ? "Entrar"
                  : "Criar conta"}
            </button>

            {/* Toggle */}
            <p className="text-center text-[13px] text-[#6B7280]">
              {mode === "login" ? (
                <>
                  Não tem conta?{" "}
                  <button
                    type="button"
                    onClick={toggleMode}
                    className="font-semibold text-[#DC2626]"
                  >
                    Cadastrar
                  </button>
                </>
              ) : (
                <>
                  Já tem conta?{" "}
                  <button
                    type="button"
                    onClick={toggleMode}
                    className="font-semibold text-[#DC2626]"
                  >
                    Entrar
                  </button>
                </>
              )}
            </p>
          </form>
        </div>
      </div>
    </>
  );
}
