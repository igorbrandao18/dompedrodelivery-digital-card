/* eslint-disable @next/next/no-img-element */
"use client";

import { ArrowLeft } from "lucide-react";
import { useEscapeKey } from "@/hooks/use-escape-key";
import { useAuthFlow } from "./use-auth-flow";
import { PhoneStep } from "./phone-step";
import { OtpStep } from "./otp-step";
import { NameStep } from "./name-step";

interface AuthModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

const INPUT_CLASS =
  "w-full h-12 rounded-[12px] border border-[#E5E7EB] bg-white px-4 text-[16px] text-[#111827] placeholder-[#9CA3AF] outline-none focus:border-[#DC2626] focus:ring-1 focus:ring-[#DC2626] transition-colors";
const PRIMARY_BTN_CLASS =
  "flex h-12 w-full items-center justify-center rounded-[12px] bg-[#DC2626] text-[16px] font-bold text-white transition-colors hover:bg-[#B91C1C] disabled:opacity-[0.45]";

export function AuthModal({ onClose, onSuccess }: AuthModalProps) {
  const flow = useAuthFlow(onClose, onSuccess);
  useEscapeKey(onClose);

  const totalSteps = flow.isNewUser ? 3 : 2;

  return (
    <div className="fixed inset-0 z-[70] flex flex-col bg-[#DC2626]">
      <div className="flex items-center px-4 pt-[env(safe-area-inset-top,12px)] h-14 shrink-0">
        <button
          type="button"
          onClick={flow.handleBack}
          className="flex h-10 w-10 items-center justify-center rounded-full text-white/80 hover:text-white hover:bg-white/10 transition-colors"
        >
          <ArrowLeft size={24} />
        </button>
      </div>

      <div className="flex items-center justify-center px-6 pt-8 pb-10 shrink-0">
        <img
          src="/logo.png"
          alt="Dom Pedro Delivery"
          className="h-[56px] w-[220px] object-contain"
        />
      </div>

      <div className="flex-1 overflow-y-auto rounded-t-[28px] bg-white shadow-[0_-4px_20px_rgba(0,0,0,0.1)]">
        <div className="mx-auto max-w-md px-6 pt-8 pb-10">
          {/* Step indicator */}
          <div className="flex items-center justify-center gap-2 mb-6">
            {Array.from({ length: totalSteps }, (_, i) => (
              <div
                key={i}
                className={`h-2 w-2 rounded-full transition-colors ${
                  i < flow.step ? "bg-[#DC2626]" : "bg-[#E5E7EB]"
                }`}
              />
            ))}
          </div>

          {flow.step === 1 && (
            <PhoneStep
              phone={flow.phone}
              loading={flow.loading}
              error={flow.error}
              onPhoneChange={flow.setPhone}
              onSubmit={flow.handleRequestOtp}
              primaryBtnClass={PRIMARY_BTN_CLASS}
            />
          )}

          {flow.step === 2 && (
            <OtpStep
              phone={flow.phone}
              otp={flow.otp}
              loading={flow.loading}
              error={flow.error}
              countdown={flow.countdown}
              onOtpChange={flow.handleOtpChange}
              onOtpKeyDown={flow.handleOtpKeyDown}
              onResend={flow.handleResend}
              onBack={flow.handleBack}
              otpRefs={flow.otpRefs}
            />
          )}

          {flow.step === 3 && (
            <NameStep
              name={flow.name}
              loading={flow.loading}
              error={flow.error}
              onNameChange={flow.setName}
              onSubmit={flow.handleComplete}
              inputClass={INPUT_CLASS}
              primaryBtnClass={PRIMARY_BTN_CLASS}
            />
          )}
        </div>
      </div>
    </div>
  );
}
