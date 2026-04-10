"use client";

import { STATUS_CONFIG, PROGRESS_STEPS, getStepIndex } from "./order-constants";

export function OrderProgress({ status }: { status: string }) {
  const current = getStepIndex(status);
  const isCancelled = status === "CANCELLED";

  return (
    <div className="rounded-2xl bg-white shadow-[0_1px_4px_rgba(0,0,0,0.08)] p-4 mb-4">
      <p className="text-[14px] font-bold text-[#111827] mb-4">
        Acompanhar pedido
      </p>
      <div className="flex items-center justify-between">
        {PROGRESS_STEPS.map((step, i) => {
          const cfg = STATUS_CONFIG[step];
          const done = !isCancelled && current >= i;
          const active = !isCancelled && current === i;
          return (
            <div key={step} className="flex flex-col items-center flex-1">
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full text-[12px] font-bold transition-colors ${
                  active
                    ? `${cfg.pill} ${cfg.pillText} ring-2 ring-offset-1 ring-current`
                    : done
                      ? `${cfg.pill} ${cfg.pillText}`
                      : "bg-[#F3F4F6] text-[#9CA3AF]"
                }`}
              >
                {i + 1}
              </div>
              <span
                className={`mt-1.5 text-[10px] text-center leading-tight ${done ? "font-semibold text-[#374151]" : "text-[#9CA3AF]"}`}
              >
                {cfg.label}
              </span>
            </div>
          );
        })}
      </div>
      {isCancelled && (
        <p className="mt-3 text-center text-[13px] font-semibold text-red-600">
          Pedido cancelado
        </p>
      )}
    </div>
  );
}
