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
  Clock,
  ChevronDown,
  ChevronRight,
  UtensilsCrossed,
  ShieldCheck,
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
  onEditAddress?: () => void;
  onEditPayment?: () => void;
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
  onEditAddress,
  onEditPayment,
}: ReviewStepProps) {
  const [itemsExpanded, setItemsExpanded] = useState(false);
  const [showServiceFeeHelp, setShowServiceFeeHelp] = useState(false);

  const paymentLabel =
    PAYMENT_OPTIONS.find((o) => o.value === paymentMethod)?.label || paymentMethod;
  const PaymentIcon = BRAND_ICONS[paymentMethod] || CashIcon;

  const changeLabel =
    paymentMethod === "cash" && cashChangeAmount
      ? `Troco para ${formatCurrency(cashChangeAmount)}`
      : paymentMethod === "cash"
        ? "Sem troco"
        : null;

  const itemCount = lines.reduce((s, l) => s + l.quantity, 0);
  const isFreeDelivery = fulfillmentMode === "pickup" || deliveryFee === 0;

  return (
    <div className="py-2 space-y-0">
      {/* ── Restaurant identity ── */}
      <div className="flex items-center gap-3 px-4 pt-2 pb-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#DC2626]">
          <Store size={18} className="text-white" />
        </div>
        <div>
          <p className="text-[15px] font-bold text-[#111827]">
            {restaurantName || "Restaurante"}
          </p>
          <p className="text-[12px] text-[#9CA3AF]">
            Confira os detalhes do seu pedido
          </p>
        </div>
      </div>

      {/* ── ETA hero banner ── */}
      <div className="px-4 pb-4">
        <div className="flex items-center gap-3 rounded-[14px] bg-[#FEF2F2] p-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#DC2626]">
            <Clock size={24} className="text-white" />
          </div>
          <div>
            <p className="text-[20px] font-bold text-[#111827]">
              {estimatedMinutes - 10}–{estimatedMinutes} min
            </p>
            <p className="text-[13px] text-[#6B7280]">
              {fulfillmentMode === "delivery"
                ? "Previsão de entrega"
                : "Previsão para retirada"}
            </p>
          </div>
        </div>
      </div>

      {/* ── Collapsible items ── */}
      <div className="px-4 pb-2">
        <button
          type="button"
          onClick={() => setItemsExpanded(!itemsExpanded)}
          className="flex w-full items-center justify-between py-3 border-b border-[#F3F4F6]"
        >
          <div className="flex items-center gap-2">
            <UtensilsCrossed size={16} className="text-[#DC2626]" />
            <span className="text-[14px] font-semibold text-[#111827]">
              {itemCount} {itemCount === 1 ? "item" : "itens"}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[13px] font-medium text-[#6B7280] tabular-nums">
              {formatCurrency(subtotal)}
            </span>
            <ChevronDown
              size={16}
              className={`text-[#9CA3AF] transition-transform ${itemsExpanded ? "rotate-180" : ""}`}
            />
          </div>
        </button>

        {itemsExpanded && (
          <div className="divide-y divide-[#F3F4F6]">
            {lines.map((line) => {
              const optTotal = line.selectedOptions.reduce(
                (s, o) => s + o.priceModifier, 0
              );
              const linePrice = (line.unitPrice + optTotal) * line.quantity;
              return (
                <div key={line.lineId} className="flex items-center justify-between py-2.5">
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <span className="flex h-6 w-6 items-center justify-center rounded-[6px] bg-[#F3F4F6] text-[12px] font-bold text-[#6B7280] shrink-0">
                      {line.quantity}
                    </span>
                    <div className="min-w-0">
                      <p className="text-[14px] text-[#111827] truncate">{line.name}</p>
                      {line.optionsSummary && (
                        <p className="text-[11px] text-[#9CA3AF] truncate">
                          {line.optionsSummary}
                        </p>
                      )}
                    </div>
                  </div>
                  <span className="text-[13px] font-medium text-[#111827] tabular-nums shrink-0 ml-3">
                    {formatCurrency(linePrice)}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Meta info ── */}
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
          onEdit={onEditAddress}
        />

        {/* Payment */}
        <div className="flex items-center gap-3 px-4 py-3.5">
          <PaymentIcon size={32} />
          <div className="flex-1 min-w-0">
            <p className="text-[11px] text-[#9CA3AF]">Pagamento</p>
            <p className="text-[14px] font-medium text-[#111827]">{paymentLabel}</p>
            {changeLabel && (
              <p className="text-[12px] text-[#6B7280]">{changeLabel}</p>
            )}
          </div>
          {onEditPayment && (
            <button
              type="button"
              onClick={onEditPayment}
              className="text-[13px] font-semibold text-[#DC2626] shrink-0"
            >
              Alterar
            </button>
          )}
        </div>
      </div>

      {/* ── Summary ── */}
      <div className="border-t border-[#E5E7EB] px-4 pt-4 pb-2 space-y-2.5">
        <p className="text-[12px] font-bold text-[#9CA3AF] uppercase tracking-wider mb-2">
          Resumo de valores
        </p>

        <SummaryRow label="Subtotal" value={formatCurrency(subtotal)} />

        {/* Delivery — green badge if free */}
        <div className="flex justify-between text-[14px]">
          <span className="text-[#6B7280]">
            {fulfillmentMode === "pickup" ? "Retirada" : "Entrega"}
          </span>
          {isFreeDelivery ? (
            <span className="rounded-full bg-[#DCFCE7] px-2.5 py-0.5 text-[12px] font-semibold text-[#16A34A]">
              Grátis
            </span>
          ) : (
            <span className="text-[#6B7280] tabular-nums">
              {formatCurrency(deliveryFee)}
            </span>
          )}
        </div>

        {/* Service fee with help tooltip */}
        <div>
          <div className="flex justify-between text-[14px]">
            <div className="flex items-center gap-1.5">
              <span className="text-[#6B7280]">Taxa de serviço</span>
              <button
                type="button"
                onClick={() => setShowServiceFeeHelp(!showServiceFeeHelp)}
              >
                <HelpCircle size={14} className="text-[#D1D5DB]" />
              </button>
            </div>
            <span className="text-[#6B7280] tabular-nums">
              {formatCurrency(SERVICE_FEE)}
            </span>
          </div>
          {showServiceFeeHelp && (
            <p className="mt-1.5 rounded-[8px] bg-[#F9FAFB] p-2.5 text-[12px] text-[#6B7280]">
              A taxa de serviço cobre custos operacionais da plataforma.
            </p>
          )}
        </div>

        {/* Total */}
        <div className="flex justify-between pt-2 border-t border-[#E5E7EB]">
          <span className="text-[16px] font-bold text-[#111827]">Total</span>
          <span className="text-[16px] font-bold text-[#111827] tabular-nums">
            {formatCurrency(total)}
          </span>
        </div>
      </div>

      {/* ── Trust badge ── */}
      <div className="flex items-center justify-center gap-2 px-4 py-3">
        <ShieldCheck size={14} className="text-[#22C55E]" />
        <p className="text-[12px] text-[#6B7280]">
          Pagamento seguro. Se houver qualquer problema, garantimos a resolução.
        </p>
      </div>

      {error && (
        <div className="px-4">
          <ErrorAlert message={error} />
        </div>
      )}
    </div>
  );
}

/* ── Helper: meta row with optional edit button ── */
function MetaRow({
  icon,
  title,
  subtitle,
  onEdit,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  onEdit?: () => void;
}) {
  return (
    <div className="flex items-center gap-3 px-4 py-3.5">
      <div className="shrink-0">{icon}</div>
      <div className="flex-1 min-w-0">
        <p className="text-[14px] font-medium text-[#111827]">{title}</p>
        <p className="text-[12px] text-[#9CA3AF]">{subtitle}</p>
      </div>
      {onEdit && (
        <button
          type="button"
          onClick={onEdit}
          className="text-[13px] font-semibold text-[#DC2626] shrink-0"
        >
          Alterar
        </button>
      )}
    </div>
  );
}

/* ── Helper: summary row ── */
function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between text-[14px]">
      <span className="text-[#6B7280]">{label}</span>
      <span className="text-[#6B7280] tabular-nums">{value}</span>
    </div>
  );
}
