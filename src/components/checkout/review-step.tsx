"use client";

import { useState } from "react";
import type { CartLine, FulfillmentMode, UserAddress } from "@/lib/types";
import { formatCurrency } from "@/lib/format";
import { SERVICE_FEE } from "@/lib/constants";
import {
  Bike,
  MapPin,
  Tag,
  HelpCircle,
  MessageSquare,
  UtensilsCrossed,
  ShieldCheck,
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
  restaurantLogo?: string | null;
  estimatedMinutes?: number;
  onEditAddress?: () => void;
  onEditPayment?: () => void;
  onEditItems?: () => void;
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
  restaurantLogo,
  estimatedMinutes = 40,
  onEditAddress,
  onEditPayment,
  onEditItems,
}: ReviewStepProps) {
  const [showServiceFeeHelp, setShowServiceFeeHelp] = useState(false);

  const paymentLabel =
    PAYMENT_OPTIONS.find((o) => o.value === paymentMethod)?.label || paymentMethod;
  const PaymentIcon = BRAND_ICONS[paymentMethod] || CashIcon;

  const isFreeDelivery = fulfillmentMode === "pickup" || deliveryFee === 0;

  return (
    <div className="pb-4">
      {/* ═══════ RESTAURANT + ITEMS ═══════ */}
      <div className="px-4 pt-4">
        {/* Restaurant header */}
        <div className="flex items-center gap-3 mb-4">
          {restaurantLogo ? (
            <img
              src={restaurantLogo}
              alt={restaurantName || ""}
              className="h-12 w-12 rounded-full object-cover bg-[#F9FAFB]"
            />
          ) : (
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#F3F4F6]">
              <UtensilsCrossed size={20} className="text-[#9CA3AF]" />
            </div>
          )}
          <div className="flex-1">
            <p className="text-[16px] font-bold text-[#111827]">
              {restaurantName || "Restaurante"}
            </p>
            {onEditItems && (
              <button
                type="button"
                onClick={onEditItems}
                className="text-[14px] font-semibold text-[#DC2626] mt-0.5"
              >
                Adicionar mais itens
              </button>
            )}
          </div>
        </div>

        {/* Items section title */}
        <p className="text-[14px] font-bold text-[#111827] mb-2">Itens adicionados</p>

        {/* Items list */}
        <div className="divide-y divide-[#F3F4F6]">
          {lines.map((line) => {
            const optTotal = line.selectedOptions.reduce(
              (s, o) => s + o.priceModifier, 0
            );
            const linePrice = (line.unitPrice + optTotal) * line.quantity;
            return (
              <div key={line.lineId} className="flex gap-3 py-3">
                {/* Thumbnail 88x88 */}
                {line.imageUrl ? (
                  <div className="h-[88px] w-[88px] shrink-0 overflow-hidden rounded-[8px] bg-[#F9FAFB]">
                    <img src={line.imageUrl} alt={line.name} className="h-full w-full object-cover" />
                  </div>
                ) : (
                  <div className="flex h-[88px] w-[88px] shrink-0 items-center justify-center rounded-[8px] bg-[#F3F4F6]">
                    <UtensilsCrossed size={24} className="text-[#9CA3AF]" />
                  </div>
                )}

                {/* Item details */}
                <div className="flex-1 min-w-0">
                  <p className="text-[14px] font-semibold text-[#111827] line-clamp-2">
                    {line.name}
                  </p>
                  {line.optionsSummary && (
                    <p className="text-[12px] text-[#9CA3AF] line-clamp-3 mt-0.5">
                      {line.optionsSummary}
                    </p>
                  )}
                  {line.customerNote && (
                    <div className="flex items-start gap-1 mt-0.5">
                      <MessageSquare size={10} className="text-[#D1D5DB] mt-0.5 shrink-0" />
                      <p className="text-[12px] italic text-[#9CA3AF] line-clamp-2">
                        {line.customerNote}
                      </p>
                    </div>
                  )}
                  <p className="text-[14px] font-bold text-[#111827] mt-1 tabular-nums">
                    {formatCurrency(linePrice)}
                  </p>
                </div>

                {/* Quantity */}
                <span className="text-[16px] font-bold text-[#6B7280] shrink-0">
                  {line.quantity}×
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Add more items (centered, below items) */}
      {onEditItems && (
        <div className="px-4 pb-2 pt-1">
          <button
            type="button"
            onClick={onEditItems}
            className="w-full text-center py-2 text-[14px] font-semibold text-[#DC2626]"
          >
            Adicionar mais itens
          </button>
        </div>
      )}

      {/* ═══════ META INFO ═══════ */}
      <div className="mt-6 px-4 space-y-4">
        {/* Delivery time */}
        <MetaRow
          icon={
            <div className="flex h-10 w-10 items-center justify-center rounded-[8px] bg-[#FEF2F2]">
              <Bike size={22} className="text-[#DC2626]" />
            </div>
          }
          title={fulfillmentMode === "delivery" ? "Previsão de entrega" : "Previsão de retirada"}
          subtitle={
            fulfillmentMode === "delivery"
              ? `${estimatedMinutes}–${estimatedMinutes + 10} min`
              : `${Math.max(10, estimatedMinutes - 20)}–${estimatedMinutes - 10} min`
          }
        />

        {/* Address */}
        <MetaRow
          icon={
            <div className="flex h-10 w-10 items-center justify-center rounded-[8px] bg-[#FEF2F2]">
              <MapPin size={22} className="text-[#DC2626]" />
            </div>
          }
          title={
            fulfillmentMode === "delivery" && selectedAddress
              ? `${selectedAddress.street}${selectedAddress.number ? `, ${selectedAddress.number}` : ""}`
              : restaurantName || "Retirada na loja"
          }
          subtitle={
            fulfillmentMode === "delivery" && selectedAddress
              ? `${selectedAddress.neighborhood} · ${selectedAddress.city}, ${selectedAddress.state}`
              : "Retirada na loja"
          }
          onEdit={onEditAddress}
        />

        {/* Coupon */}
        <MetaRow
          icon={
            <div className="flex h-10 w-10 items-center justify-center rounded-[8px] bg-[#F3F4F6]">
              <Tag size={22} className="text-[#9CA3AF]" />
            </div>
          }
          title="Cupom"
          subtitle="Adicione um código de desconto"
          muted
        />

        {/* Payment */}
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center">
            <PaymentIcon size={36} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-bold text-[#9CA3AF] uppercase tracking-[0.4px]">
              Pagamento na entrega
            </p>
            <p className="text-[14px] font-bold text-[#111827]">{paymentLabel}</p>
            <p className="text-[12px] text-[#6B7280]">
              {paymentMethod === "cash" && cashChangeAmount
                ? `Troco para ${formatCurrency(cashChangeAmount)}`
                : paymentMethod === "cash"
                  ? "Sem troco"
                  : "Crédito na entrega"}
            </p>
          </div>
          <span className="text-[14px] font-bold text-[#111827] tabular-nums shrink-0">
            {formatCurrency(total)}
          </span>
          {onEditPayment && (
            <button type="button" onClick={onEditPayment} className="text-[13px] font-semibold text-[#DC2626] shrink-0 ml-1">
              Alterar
            </button>
          )}
        </div>
      </div>

      {/* ═══════ SUMMARY ═══════ */}
      <div className="mt-6 px-4 space-y-2.5">
        <p className="text-[14px] font-bold text-[#111827] mb-2">
          Resumo de valores
        </p>

        <SummaryRow label="Subtotal" value={formatCurrency(subtotal)} />

        <div className="flex justify-between text-[14px]">
          <span className="text-[#6B7280]">
            {fulfillmentMode === "pickup" ? "Retirada na loja" : "Taxa de entrega"}
          </span>
          {isFreeDelivery ? (
            <span className="rounded-full bg-[#DCFCE7] px-2.5 py-0.5 text-[12px] font-semibold text-[#16A34A]">
              Grátis
            </span>
          ) : (
            <span className="text-[#6B7280] tabular-nums">{formatCurrency(deliveryFee)}</span>
          )}
        </div>

        <div>
          <div className="flex justify-between text-[14px]">
            <div className="flex items-center gap-1.5">
              <span className="text-[#6B7280]">Taxa de serviço</span>
              <button type="button" onClick={() => setShowServiceFeeHelp(!showServiceFeeHelp)}>
                <HelpCircle size={14} className="text-[#D1D5DB]" />
              </button>
            </div>
            <span className="text-[#6B7280] tabular-nums">{formatCurrency(SERVICE_FEE)}</span>
          </div>
          {showServiceFeeHelp && (
            <p className="mt-1.5 rounded-[8px] bg-[#F9FAFB] p-2.5 text-[12px] text-[#6B7280]">
              Valor de manutenção da plataforma. Pode ser ajustado.
            </p>
          )}
        </div>

        <div className="flex justify-between pt-2 mt-1 border-t border-[#E5E7EB]">
          <span className="text-[14px] font-bold text-[#111827]">Total</span>
          <span className="text-[14px] font-bold text-[#111827] tabular-nums">{formatCurrency(total)}</span>
        </div>
      </div>

      {/* ═══════ TRUST ═══════ */}
      <div className="flex items-center justify-center gap-2 px-4 py-4 mt-2">
        <ShieldCheck size={14} className="text-[#22C55E]" />
        <p className="text-[12px] text-[#9CA3AF]">
          Pagamento seguro · Garantia de resolução
        </p>
      </div>


      {error && (
        <div className="px-4"><ErrorAlert message={error} /></div>
      )}
    </div>
  );
}

function MetaRow({
  icon,
  title,
  subtitle,
  muted,
  onEdit,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  muted?: boolean;
  onEdit?: () => void;
}) {
  return (
    <div className="flex items-center gap-3">
      <div className="shrink-0">{icon}</div>
      <div className="flex-1 min-w-0">
        <p className={`text-[14px] font-medium ${muted ? "text-[#9CA3AF]" : "text-[#111827]"}`}>{title}</p>
        <p className="text-[12px] text-[#9CA3AF]">{subtitle}</p>
      </div>
      {onEdit && (
        <button type="button" onClick={onEdit} className="text-[13px] font-semibold text-[#DC2626] shrink-0">
          Alterar
        </button>
      )}
    </div>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between text-[14px]">
      <span className="text-[#6B7280]">{label}</span>
      <span className="text-[#6B7280] tabular-nums">{value}</span>
    </div>
  );
}
