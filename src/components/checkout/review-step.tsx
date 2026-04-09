"use client";

import type { CartLine, FulfillmentMode, UserAddress } from "@/lib/types";
import { formatCurrency } from "@/lib/format";
import { SERVICE_FEE } from "@/lib/constants";
import {
  Bike,
  MapPin,
  Tag,
  CreditCard,
  HelpCircle,
  Clock,
  UtensilsCrossed,
  MessageSquare,
  Store,
} from "lucide-react";
import { ErrorAlert } from "@/components/ui/error-alert";
import { PAYMENT_OPTIONS } from "./payment-step";
import {
  CashIcon,
  VisaIcon,
  MastercardIcon,
  EloIcon,
  HipercardIcon,
} from "./card-brand-icons";

const BRAND_ICONS: Record<string, React.FC<{ size?: number }>> = {
  cash: CashIcon,
  credit_visa: VisaIcon,
  credit_mastercard: MastercardIcon,
  credit_elo: EloIcon,
  credit_hipercard: HipercardIcon,
};

interface ReviewStepProps {
  lines: CartLine[];
  fulfillmentMode: FulfillmentMode;
  selectedAddress: UserAddress | undefined;
  paymentMethod: string;
  cashChangeAmount: number | null;
  subtotal: number;
  deliveryFee: number;
  total: number;
  error: string | null;
  restaurantName?: string;
  estimatedMinutes?: number;
}

export function ReviewStep({
  lines,
  fulfillmentMode,
  selectedAddress,
  paymentMethod,
  cashChangeAmount,
  subtotal,
  deliveryFee,
  total,
  error,
  restaurantName,
  estimatedMinutes = 40,
}: ReviewStepProps) {
  const paymentLabel =
    PAYMENT_OPTIONS.find((o) => o.value === paymentMethod)?.label || paymentMethod;
  const PaymentIcon = BRAND_ICONS[paymentMethod] || CashIcon;

  return (
    <div className="py-4 space-y-0">
      {/* ── Items list ── */}
      <div className="px-4 pb-4">
        <p className="text-[12px] font-bold text-[#9CA3AF] uppercase tracking-wider mb-3">
          Itens do pedido
        </p>
        <div className="space-y-0 divide-y divide-[#F3F4F6]">
          {lines.map((line) => {
            const optTotal = line.selectedOptions.reduce(
              (s, o) => s + o.priceModifier, 0
            );
            const linePrice = (line.unitPrice + optTotal) * line.quantity;
            return (
              <div key={line.lineId} className="flex gap-3 py-3">
                {/* Thumbnail */}
                {line.imageUrl ? (
                  <div className="h-[64px] w-[64px] shrink-0 overflow-hidden rounded-[8px] bg-[#F9FAFB]">
                    <img src={line.imageUrl} alt={line.name} className="h-full w-full object-cover" />
                  </div>
                ) : (
                  <div className="flex h-[64px] w-[64px] shrink-0 items-center justify-center rounded-[8px] bg-[#F3F4F6]">
                    <UtensilsCrossed size={20} className="text-[#9CA3AF]" />
                  </div>
                )}
                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-[14px] font-semibold text-[#111827] line-clamp-2">
                      {line.name}
                    </p>
                    <span className="text-[13px] font-medium text-[#6B7280] shrink-0 tabular-nums">
                      {line.quantity}×
                    </span>
                  </div>
                  {line.optionsSummary && (
                    <p className="text-[12px] text-[#9CA3AF] line-clamp-2 mt-0.5">
                      {line.optionsSummary}
                    </p>
                  )}
                  {line.customerNote && (
                    <div className="flex items-center gap-1 mt-0.5">
                      <MessageSquare size={10} className="text-[#D1D5DB]" />
                      <p className="text-[11px] text-[#9CA3AF] line-clamp-1">{line.customerNote}</p>
                    </div>
                  )}
                  <p className="text-[13px] font-semibold text-[#111827] mt-1 tabular-nums">
                    {formatCurrency(linePrice)}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Meta info block ── */}
      <div className="border-t border-[#E5E7EB] divide-y divide-[#F3F4F6]">
        {/* Delivery time */}
        <MetaRow
          icon={<Bike size={18} className="text-[#DC2626]" />}
          title={fulfillmentMode === "delivery" ? "Entrega hoje" : "Retirada hoje"}
          subtitle={`${estimatedMinutes - 10}–${estimatedMinutes} min`}
        />

        {/* Address */}
        <MetaRow
          icon={<MapPin size={18} className="text-[#DC2626]" />}
          title={
            fulfillmentMode === "delivery" && selectedAddress
              ? `${selectedAddress.street}${selectedAddress.number ? `, ${selectedAddress.number}` : ""}`
              : restaurantName || "Retirada na loja"
          }
          subtitle={
            fulfillmentMode === "delivery" && selectedAddress
              ? `${selectedAddress.neighborhood} · ${selectedAddress.city}, ${selectedAddress.state}`
              : "Retire no estabelecimento"
          }
        />

        {/* Coupon */}
        <MetaRow
          icon={<Tag size={18} className="text-[#9CA3AF]" />}
          title="Nenhum cupom aplicado"
          subtitle="Adicione um código"
          muted
        />

        {/* Payment */}
        <div className="flex items-center gap-3 px-4 py-3.5">
          <PaymentIcon size={32} />
          <div className="flex-1 min-w-0">
            <p className="text-[11px] text-[#9CA3AF]">Pagamento</p>
            <p className="text-[14px] font-medium text-[#111827]">{paymentLabel}</p>
            {paymentMethod === "cash" && cashChangeAmount && (
              <p className="text-[12px] text-[#6B7280]">
                Troco para {formatCurrency(cashChangeAmount)}
              </p>
            )}
          </div>
          <span className="text-[14px] font-bold text-[#111827] tabular-nums shrink-0">
            {formatCurrency(total)}
          </span>
        </div>
      </div>

      {/* ── Summary ── */}
      <div className="border-t border-[#E5E7EB] px-4 pt-4 pb-2 space-y-2.5">
        <p className="text-[12px] font-bold text-[#9CA3AF] uppercase tracking-wider mb-2">
          Resumo de valores
        </p>

        <SummaryRow label="Subtotal" value={formatCurrency(subtotal)} />
        <SummaryRow
          label={fulfillmentMode === "pickup" ? "Retirada na loja" : "Entrega"}
          value={fulfillmentMode === "pickup" ? "Grátis" : formatCurrency(deliveryFee)}
        />
        <SummaryRow
          label="Taxa de serviço"
          value={formatCurrency(SERVICE_FEE)}
          helpIcon
        />

        <div className="flex justify-between pt-2 border-t border-[#E5E7EB]">
          <span className="text-[16px] font-bold text-[#111827]">Total</span>
          <span className="text-[16px] font-bold text-[#111827] tabular-nums">
            {formatCurrency(total)}
          </span>
        </div>
      </div>

      {error && (
        <div className="px-4">
          <ErrorAlert message={error} />
        </div>
      )}
    </div>
  );
}

/* ── Helper components ── */

function MetaRow({
  icon,
  title,
  subtitle,
  muted,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  muted?: boolean;
}) {
  return (
    <div className="flex items-center gap-3 px-4 py-3.5">
      <div className="shrink-0">{icon}</div>
      <div className="flex-1 min-w-0">
        <p className={`text-[14px] font-medium ${muted ? "text-[#9CA3AF]" : "text-[#111827]"}`}>
          {title}
        </p>
        <p className="text-[12px] text-[#9CA3AF]">{subtitle}</p>
      </div>
    </div>
  );
}

function SummaryRow({
  label,
  value,
  helpIcon,
}: {
  label: string;
  value: string;
  helpIcon?: boolean;
}) {
  return (
    <div className="flex justify-between text-[14px]">
      <div className="flex items-center gap-1.5">
        <span className="text-[#6B7280]">{label}</span>
        {helpIcon && <HelpCircle size={14} className="text-[#D1D5DB]" />}
      </div>
      <span className="text-[#6B7280] tabular-nums">{value}</span>
    </div>
  );
}
