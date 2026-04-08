"use client";

import { useState, useEffect, useRef } from "react";
import type { Restaurant } from "@/lib/types";
import { useCartStore } from "@/stores/cart";
import { useCheckoutStore } from "@/stores/checkout";
import { useAuthStore } from "@/stores/auth";
import { SERVICE_FEE, BASE_DELIVERY_FEE, FAST_DELIVERY_SURCHARGE } from "@/lib/constants";
import { formatCurrency } from "@/lib/format";
import {
  ArrowLeft,
  Truck,
  Store,
  MapPin,
  Plus,
  Trash2,
  Check,
  CreditCard,
  Banknote,
  Loader2,
  CheckCircle2,
  ChevronRight,
  Zap,
  Clock,
} from "lucide-react";
import { AddressMapPicker } from "@/components/address-map-picker";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

type CheckoutStep =
  | "fulfillment"
  | "address-select"
  | "address-form"
  | "payment"
  | "review"
  | "processing"
  | "success";

interface CheckoutModalProps {
  restaurant: Restaurant;
  onClose: () => void;
  onSuccess: () => void;
}

const STEP_TITLES: Record<CheckoutStep, string> = {
  fulfillment: "Tipo de entrega",
  "address-select": "Endereco de entrega",
  "address-form": "Novo endereco",
  payment: "Pagamento",
  review: "Revisar pedido",
  processing: "Processando",
  success: "Pedido enviado",
};

const PAYMENT_OPTIONS: { value: string; label: string; icon: typeof CreditCard }[] = [
  { value: "cash", label: "Dinheiro", icon: Banknote },
  { value: "credit_visa", label: "Visa (Credito)", icon: CreditCard },
  { value: "credit_mastercard", label: "Mastercard (Credito)", icon: CreditCard },
  { value: "credit_elo", label: "Elo (Credito)", icon: CreditCard },
  { value: "credit_hipercard", label: "Hipercard (Credito)", icon: CreditCard },
];

const inputClass =
  "w-full h-12 rounded-[12px] border border-[#E5E7EB] bg-white px-4 text-[16px] text-[#111827] placeholder-[#9CA3AF] outline-none focus:border-[#DC2626] focus:ring-1 focus:ring-[#DC2626] transition-colors";

const primaryBtnClass =
  "flex h-12 w-full items-center justify-center rounded-[12px] bg-[#DC2626] text-[16px] font-bold text-white transition-colors hover:bg-[#B91C1C] disabled:opacity-[0.45]";

interface AddressFormData {
  zipCode: string;
  street: string;
  number: string;
  complement: string;
  referenceNote: string;
  neighborhood: string;
  city: string;
  state: string;
}

export function CheckoutModal({ restaurant, onClose, onSuccess }: CheckoutModalProps) {
  const addressSaveRef = useRef<(() => void) | null>(null);
  const [step, setStep] = useState<CheckoutStep>("fulfillment");
  const [addressForm, setAddressForm] = useState<AddressFormData>({
    zipCode: "",
    street: "",
    number: "",
    complement: "",
    referenceNote: "",
    neighborhood: "",
    city: "",
    state: "",
  });
  const [cepLoading, setCepLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const user = useAuthStore((s) => s.user);
  const lines = useCartStore((s) => s.lines);
  const getSubtotal = useCartStore((s) => s.getSubtotal);
  const clearAll = useCartStore((s) => s.clearAll);

  const fulfillmentMode = useCheckoutStore((s) => s.fulfillmentMode);
  const deliveryTier = useCheckoutStore((s) => s.deliveryTier);
  const paymentMethod = useCheckoutStore((s) => s.paymentMethod);
  const cashChangeAmount = useCheckoutStore((s) => s.cashChangeAmount);
  const selectedAddressId = useCheckoutStore((s) => s.selectedAddressId);
  const addresses = useCheckoutStore((s) => s.addresses);
  const loading = useCheckoutStore((s) => s.loading);
  const error = useCheckoutStore((s) => s.error);

  const setFulfillmentMode = useCheckoutStore((s) => s.setFulfillmentMode);
  const setDeliveryTier = useCheckoutStore((s) => s.setDeliveryTier);
  const setPaymentMethod = useCheckoutStore((s) => s.setPaymentMethod);
  const setCashChangeAmount = useCheckoutStore((s) => s.setCashChangeAmount);
  const setSelectedAddressId = useCheckoutStore((s) => s.setSelectedAddressId);
  const fetchAddresses = useCheckoutStore((s) => s.fetchAddresses);
  const addAddress = useCheckoutStore((s) => s.addAddress);
  const deleteAddress = useCheckoutStore((s) => s.deleteAddress);
  const submitOrder = useCheckoutStore((s) => s.submitOrder);
  const getDeliveryFee = useCheckoutStore((s) => s.getDeliveryFee);
  const resetCheckout = useCheckoutStore((s) => s.reset);

  const subtotal = getSubtotal();
  const deliveryFee = getDeliveryFee();
  const total = subtotal + deliveryFee + SERVICE_FEE;

  const selectedAddress = addresses.find((a) => a.id === selectedAddressId);

  // Fetch addresses on mount
  useEffect(() => {
    if (user?.id) {
      fetchAddresses(user.id);
    }
  }, [user?.id, fetchAddresses]);

  // Escape key handler
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  // Lock body scroll
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  // CEP lookup
  const handleCepChange = async (cep: string) => {
    const digits = cep.replace(/\D/g, "").slice(0, 8);
    const formatted = digits.length > 5 ? `${digits.slice(0, 5)}-${digits.slice(5)}` : digits;
    setAddressForm((prev) => ({ ...prev, zipCode: formatted }));

    if (digits.length === 8) {
      setCepLoading(true);
      try {
        const res = await fetch(`${API_URL}/cep?cep=${digits}`, {
          credentials: "include",
          headers: { "Content-Type": "application/json" },
        });
        if (res.ok) {
          const data = await res.json();
          setAddressForm((prev) => ({
            ...prev,
            street: data.street || data.logradouro || prev.street,
            neighborhood: data.neighborhood || data.bairro || prev.neighborhood,
            city: data.city || data.localidade || prev.city,
            state: data.state || data.uf || prev.state,
          }));
        }
      } catch {
        // ignore cep lookup errors
      } finally {
        setCepLoading(false);
      }
    }
  };

  const handleSaveAddress = async () => {
    setFormError(null);
    if (!addressForm.street.trim()) {
      setFormError("Informe a rua.");
      return;
    }
    if (!addressForm.number.trim()) {
      setFormError("Informe o numero.");
      return;
    }
    if (!addressForm.neighborhood.trim()) {
      setFormError("Informe o bairro.");
      return;
    }
    if (!user?.id) return;

    try {
      await addAddress(user.id, {
        street: addressForm.street,
        number: addressForm.number,
        complement: addressForm.complement || undefined,
        referenceNote: addressForm.referenceNote || undefined,
        neighborhood: addressForm.neighborhood,
        city: addressForm.city,
        state: addressForm.state,
        zipCode: addressForm.zipCode.replace(/\D/g, ""),
      });
      setAddressForm({
        zipCode: "",
        street: "",
        number: "",
        complement: "",
        referenceNote: "",
        neighborhood: "",
        city: "",
        state: "",
      });
      setStep("address-select");
    } catch {
      // error already set in store
    }
  };

  const handleSubmitOrder = async () => {
    setStep("processing");
    try {
      await submitOrder(lines, restaurant.id);
      clearAll();
      setStep("success");
    } catch {
      setStep("review");
    }
  };

  const handleBack = () => {
    switch (step) {
      case "fulfillment":
        resetCheckout();
        onClose();
        break;
      case "address-select":
        setStep("fulfillment");
        break;
      case "address-form":
        setStep("address-select");
        break;
      case "payment":
        if (fulfillmentMode === "delivery") {
          setStep("address-select");
        } else {
          setStep("fulfillment");
        }
        break;
      case "review":
        setStep("payment");
        break;
      default:
        break;
    }
  };

  const handleContinueFromFulfillment = () => {
    if (fulfillmentMode === "delivery") {
      setStep("address-select");
    } else {
      setStep("payment");
    }
  };

  const handleContinueFromAddress = () => {
    if (!selectedAddressId) return;
    setStep("payment");
  };

  const handleContinueFromPayment = () => {
    setStep("review");
  };

  const stepSequence =
    fulfillmentMode === "delivery"
      ? ["fulfillment", "address-select", "payment", "review"]
      : ["fulfillment", "payment", "review"];
  const stepIndex = stepSequence.indexOf(
    step === "address-form" ? "address-select" : step
  );
  const totalSteps = stepSequence.length;

  return (
    <div className="fixed inset-0 z-[70] flex flex-col bg-white">
      {/* Top bar */}
      {step !== "processing" && step !== "success" && (
        <div className="flex items-center justify-between border-b border-[#E5E7EB] px-4 h-14 shrink-0">
          <button
            type="button"
            onClick={handleBack}
            className="flex h-10 w-10 items-center justify-center rounded-full text-[#111827] hover:bg-[#F3F4F6] transition-colors"
          >
            <ArrowLeft size={22} />
          </button>
          <h2 className="text-[16px] font-bold text-[#111827]">
            {STEP_TITLES[step]}
          </h2>
          {/* Step indicator */}
          <div className="flex items-center gap-1.5">
            {Array.from({ length: totalSteps }, (_, i) => (
              <div
                key={i}
                className={`h-2 w-2 rounded-full transition-colors ${
                  i <= stepIndex ? "bg-[#DC2626]" : "bg-[#E5E7EB]"
                }`}
              />
            ))}
          </div>
        </div>
      )}

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {/* ── Step: Fulfillment ── */}
        {step === "fulfillment" && (
          <div className="px-4 py-6 space-y-5">
            <p className="text-[14px] text-[#6B7280]">
              Como deseja receber seu pedido?
            </p>

            {/* Delivery option */}
            <button
              type="button"
              onClick={() => setFulfillmentMode("delivery")}
              className={`flex w-full items-center gap-4 rounded-[16px] border-2 p-4 text-left transition-colors ${
                fulfillmentMode === "delivery"
                  ? "border-[#DC2626] bg-[rgba(220,38,38,0.04)]"
                  : "border-[#E5E7EB] bg-white"
              }`}
            >
              <div
                className={`flex h-12 w-12 items-center justify-center rounded-full ${
                  fulfillmentMode === "delivery"
                    ? "bg-[#DC2626] text-white"
                    : "bg-[#F3F4F6] text-[#6B7280]"
                }`}
              >
                <Truck size={22} />
              </div>
              <div className="flex-1">
                <p className="text-[16px] font-bold text-[#111827]">Entrega</p>
                <p className="text-[13px] text-[#6B7280]">
                  Receba no seu endereco
                </p>
              </div>
              {fulfillmentMode === "delivery" && (
                <Check size={20} className="text-[#DC2626]" />
              )}
            </button>

            {/* Pickup option */}
            <button
              type="button"
              onClick={() => setFulfillmentMode("pickup")}
              className={`flex w-full items-center gap-4 rounded-[16px] border-2 p-4 text-left transition-colors ${
                fulfillmentMode === "pickup"
                  ? "border-[#DC2626] bg-[rgba(220,38,38,0.04)]"
                  : "border-[#E5E7EB] bg-white"
              }`}
            >
              <div
                className={`flex h-12 w-12 items-center justify-center rounded-full ${
                  fulfillmentMode === "pickup"
                    ? "bg-[#DC2626] text-white"
                    : "bg-[#F3F4F6] text-[#6B7280]"
                }`}
              >
                <Store size={22} />
              </div>
              <div className="flex-1">
                <p className="text-[16px] font-bold text-[#111827]">
                  Retirada na loja
                </p>
                <p className="text-[13px] text-[#6B7280]">
                  Retire no estabelecimento
                </p>
              </div>
              {fulfillmentMode === "pickup" && (
                <Check size={20} className="text-[#DC2626]" />
              )}
            </button>

            {/* Delivery tier (only if delivery) */}
            {fulfillmentMode === "delivery" && (
              <div className="space-y-3 pt-2">
                <p className="text-[14px] font-semibold text-[#111827]">
                  Velocidade de entrega
                </p>

                <button
                  type="button"
                  onClick={() => setDeliveryTier("standard")}
                  className={`flex w-full items-center gap-3 rounded-[12px] border-2 p-3 text-left transition-colors ${
                    deliveryTier === "standard"
                      ? "border-[#DC2626] bg-[rgba(220,38,38,0.04)]"
                      : "border-[#E5E7EB] bg-white"
                  }`}
                >
                  <Clock size={18} className={deliveryTier === "standard" ? "text-[#DC2626]" : "text-[#6B7280]"} />
                  <div className="flex-1">
                    <p className="text-[14px] font-medium text-[#111827]">Padrao</p>
                    <p className="text-[12px] text-[#6B7280]">40-60 min</p>
                  </div>
                  <span className="text-[14px] font-bold text-[#111827]">
                    {formatCurrency(BASE_DELIVERY_FEE)}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setDeliveryTier("fast")}
                  className={`flex w-full items-center gap-3 rounded-[12px] border-2 p-3 text-left transition-colors ${
                    deliveryTier === "fast"
                      ? "border-[#DC2626] bg-[rgba(220,38,38,0.04)]"
                      : "border-[#E5E7EB] bg-white"
                  }`}
                >
                  <Zap size={18} className={deliveryTier === "fast" ? "text-[#DC2626]" : "text-[#6B7280]"} />
                  <div className="flex-1">
                    <p className="text-[14px] font-medium text-[#111827]">Rapida</p>
                    <p className="text-[12px] text-[#6B7280]">20-35 min</p>
                  </div>
                  <span className="text-[14px] font-bold text-[#111827]">
                    {formatCurrency(BASE_DELIVERY_FEE + FAST_DELIVERY_SURCHARGE)}
                  </span>
                </button>
              </div>
            )}

            {/* Selected address preview (delivery only) */}
            {fulfillmentMode === "delivery" && selectedAddress && (
              <div className="flex items-center gap-3 rounded-[12px] border border-[#E5E7EB] p-3">
                <MapPin size={18} className="text-[#DC2626] shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-[14px] font-medium text-[#111827] truncate">
                    {selectedAddress.street}
                    {selectedAddress.number ? `, ${selectedAddress.number}` : ""}
                  </p>
                  <p className="text-[12px] text-[#6B7280] truncate">
                    {selectedAddress.neighborhood} - {selectedAddress.city}
                  </p>
                </div>
                <ChevronRight size={16} className="text-[#9CA3AF] shrink-0" />
              </div>
            )}
          </div>
        )}

        {/* ── Step: Address selection ── */}
        {step === "address-select" && (
          <div className="px-4 py-6 space-y-4">
            {addresses.length === 0 && !loading && (
              <div className="flex flex-col items-center py-8">
                <MapPin size={40} className="text-[#D1D5DB] mb-3" />
                <p className="text-[14px] text-[#6B7280]">
                  Nenhum endereco salvo
                </p>
              </div>
            )}

            {addresses.map((addr) => (
              <div
                key={addr.id}
                className={`relative flex items-start gap-3 rounded-[16px] border-2 p-4 transition-colors ${
                  selectedAddressId === addr.id
                    ? "border-[#DC2626] bg-[rgba(220,38,38,0.04)]"
                    : "border-[#E5E7EB] bg-white"
                }`}
              >
                <button
                  type="button"
                  onClick={() => setSelectedAddressId(addr.id)}
                  className="flex-1 text-left"
                >
                  <p className="text-[14px] font-medium text-[#111827]">
                    {addr.street}
                    {addr.number ? `, ${addr.number}` : ""}
                  </p>
                  {addr.complement && (
                    <p className="text-[12px] text-[#6B7280]">{addr.complement}</p>
                  )}
                  <p className="text-[12px] text-[#6B7280]">
                    {addr.neighborhood} - {addr.city}, {addr.state}
                  </p>
                </button>
                {selectedAddressId === addr.id && (
                  <Check size={20} className="text-[#DC2626] shrink-0 mt-0.5" />
                )}
                <button
                  type="button"
                  onClick={() => user?.id && deleteAddress(user.id, addr.id)}
                  className="text-[#9CA3AF] hover:text-[#DC2626] transition-colors shrink-0 mt-0.5"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}

            <button
              type="button"
              onClick={() => setStep("address-form")}
              className="flex w-full items-center justify-center gap-2 rounded-[12px] border-2 border-dashed border-[#E5E7EB] p-4 text-[14px] font-medium text-[#6B7280] transition-colors hover:border-[#DC2626] hover:text-[#DC2626]"
            >
              <Plus size={18} />
              Adicionar endereco
            </button>

            {error && (
              <div className="flex items-center gap-2 rounded-[8px] bg-red-50 px-3 py-2">
                <p className="text-[13px] text-[#DC2626]">{error}</p>
              </div>
            )}
          </div>
        )}

        {/* ── Step: Address form (map + form) ── */}
        {step === "address-form" && (
          <AddressMapPicker
            saveRef={addressSaveRef}
            onBack={() => setStep("address-select")}
            onConfirm={async (addr) => {
              if (user?.id) {
                await addAddress(user.id, addr);
                await fetchAddresses(user.id);
              }
              setStep("address-select");
            }}
          />
        )}

        {/* ── Step: Payment ── */}
        {step === "payment" && (
          <div className="px-4 py-6 space-y-3">
            <p className="text-[14px] text-[#6B7280] mb-2">
              Escolha a forma de pagamento
            </p>

            {PAYMENT_OPTIONS.map((opt) => {
              const Icon = opt.icon;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setPaymentMethod(opt.value as typeof paymentMethod)}
                  className={`flex w-full items-center gap-3 rounded-[12px] border-2 p-4 text-left transition-colors ${
                    paymentMethod === opt.value
                      ? "border-[#DC2626] bg-[rgba(220,38,38,0.04)]"
                      : "border-[#E5E7EB] bg-white"
                  }`}
                >
                  <Icon
                    size={20}
                    className={
                      paymentMethod === opt.value
                        ? "text-[#DC2626]"
                        : "text-[#6B7280]"
                    }
                  />
                  <span className="flex-1 text-[14px] font-medium text-[#111827]">
                    {opt.label}
                  </span>
                  {paymentMethod === opt.value && (
                    <Check size={18} className="text-[#DC2626]" />
                  )}
                </button>
              );
            })}

            {/* Cash change input */}
            {paymentMethod === "cash" && (
              <div className="pt-2">
                <label className="mb-1.5 block text-[13px] font-medium text-[#374151]">
                  Troco para (opcional)
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[14px] text-[#9CA3AF]">
                    R$
                  </span>
                  <input
                    type="number"
                    inputMode="decimal"
                    placeholder="0,00"
                    value={cashChangeAmount ?? ""}
                    onChange={(e) =>
                      setCashChangeAmount(
                        e.target.value ? parseFloat(e.target.value) : null
                      )
                    }
                    className={`${inputClass} pl-10`}
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── Step: Review ── */}
        {step === "review" && (
          <div className="px-4 py-6 space-y-5">
            {/* Items */}
            <div>
              <p className="text-[14px] font-semibold text-[#111827] mb-3">
                Itens do pedido
              </p>
              <div className="space-y-2">
                {lines.map((line) => {
                  const optTotal = line.selectedOptions.reduce(
                    (s, o) => s + o.priceModifier,
                    0
                  );
                  const linePrice = (line.unitPrice + optTotal) * line.quantity;
                  return (
                    <div
                      key={line.lineId}
                      className="flex items-start justify-between py-1"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-[14px] text-[#111827]">
                          {line.quantity}x {line.name}
                        </p>
                        {line.optionsSummary && (
                          <p className="text-[12px] text-[#6B7280] truncate">
                            {line.optionsSummary}
                          </p>
                        )}
                      </div>
                      <span className="text-[14px] font-medium text-[#111827] ml-3 shrink-0">
                        {formatCurrency(linePrice)}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Delivery/pickup info */}
            <div className="rounded-[12px] border border-[#E5E7EB] p-3 space-y-2">
              <div className="flex items-center gap-2">
                {fulfillmentMode === "delivery" ? (
                  <Truck size={16} className="text-[#DC2626]" />
                ) : (
                  <Store size={16} className="text-[#DC2626]" />
                )}
                <span className="text-[14px] font-medium text-[#111827]">
                  {fulfillmentMode === "delivery" ? "Entrega" : "Retirada na loja"}
                </span>
              </div>
              {fulfillmentMode === "delivery" && selectedAddress && (
                <p className="text-[13px] text-[#6B7280] pl-6">
                  {selectedAddress.street}
                  {selectedAddress.number ? `, ${selectedAddress.number}` : ""} -{" "}
                  {selectedAddress.neighborhood}
                </p>
              )}
            </div>

            {/* Payment info */}
            <div className="rounded-[12px] border border-[#E5E7EB] p-3">
              <div className="flex items-center gap-2">
                {paymentMethod === "cash" ? (
                  <Banknote size={16} className="text-[#DC2626]" />
                ) : (
                  <CreditCard size={16} className="text-[#DC2626]" />
                )}
                <span className="text-[14px] font-medium text-[#111827]">
                  {PAYMENT_OPTIONS.find((o) => o.value === paymentMethod)?.label}
                </span>
              </div>
              {paymentMethod === "cash" && cashChangeAmount && (
                <p className="text-[13px] text-[#6B7280] pl-6 mt-1">
                  Troco para {formatCurrency(cashChangeAmount)}
                </p>
              )}
            </div>

            {/* Price breakdown */}
            <div className="border-t border-[#E5E7EB] pt-4 space-y-2">
              <div className="flex justify-between text-[14px] text-[#6B7280]">
                <span>Subtotal</span>
                <span>{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex justify-between text-[14px] text-[#6B7280]">
                <span>Entrega</span>
                <span>
                  {fulfillmentMode === "pickup"
                    ? "Gratis"
                    : formatCurrency(deliveryFee)}
                </span>
              </div>
              <div className="flex justify-between text-[14px] text-[#6B7280]">
                <span>Taxa de servico</span>
                <span>{formatCurrency(SERVICE_FEE)}</span>
              </div>
              <div className="flex justify-between border-t border-[#E5E7EB] pt-2 text-[16px] font-bold text-[#111827]">
                <span>Total</span>
                <span>{formatCurrency(total)}</span>
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 rounded-[8px] bg-red-50 px-3 py-2">
                <p className="text-[13px] text-[#DC2626]">{error}</p>
              </div>
            )}
          </div>
        )}

        {/* ── Step: Processing ── */}
        {step === "processing" && (
          <div className="flex flex-col items-center justify-center h-full py-20">
            <Loader2 size={48} className="animate-spin text-[#DC2626] mb-4" />
            <p className="text-[16px] font-bold text-[#111827]">
              Enviando seu pedido...
            </p>
            <p className="text-[14px] text-[#6B7280] mt-1">
              Aguarde um momento
            </p>
          </div>
        )}

        {/* ── Step: Success ── */}
        {step === "success" && (
          <div className="flex flex-col items-center justify-center h-full py-20 px-6">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-green-100 mb-5">
              <CheckCircle2 size={44} className="text-[#22C55E]" />
            </div>
            <h2 className="text-[22px] font-bold text-[#111827] mb-2">
              Pedido enviado!
            </h2>
            <p className="text-[14px] text-[#6B7280] text-center mb-8">
              Acompanhe o status na aba Pedidos
            </p>
            <button
              type="button"
              onClick={() => {
                resetCheckout();
                onSuccess();
              }}
              className={`${primaryBtnClass}`}
            >
              Ver pedidos
            </button>
          </div>
        )}
      </div>

      {/* Bottom CTA */}
      {step === "fulfillment" && (
        <div className="border-t border-[#E5E7EB] px-4 py-3 shrink-0">
          <div className="px-4">
            <button
              type="button"
              onClick={handleContinueFromFulfillment}
              className={primaryBtnClass}
            >
              Continuar
            </button>
          </div>
        </div>
      )}

      {step === "address-select" && (
        <div className="border-t border-[#E5E7EB] px-4 py-3 shrink-0">
          <div className="px-4">
            <button
              type="button"
              onClick={handleContinueFromAddress}
              disabled={!selectedAddressId}
              className={primaryBtnClass}
            >
              Continuar
            </button>
          </div>
        </div>
      )}

      {step === "address-form" && (
        <div className="border-t border-[#E5E7EB] px-4 py-3 shrink-0">
          <button
            type="button"
            onClick={() => addressSaveRef.current?.()}
            disabled={loading}
            className={primaryBtnClass}
          >
            {loading ? "Salvando..." : "Salvar endereço"}
          </button>
        </div>
      )}

      {step === "payment" && (
        <div className="border-t border-[#E5E7EB] px-4 py-3 shrink-0">
          <div className="px-4">
            <button
              type="button"
              onClick={handleContinueFromPayment}
              className={primaryBtnClass}
            >
              Continuar
            </button>
          </div>
        </div>
      )}

      {step === "review" && (
        <div className="border-t border-[#E5E7EB] px-4 py-3 shrink-0">
          <div className="px-4">
            <button
              type="button"
              onClick={handleSubmitOrder}
              disabled={loading}
              className={primaryBtnClass}
            >
              Fazer pedido
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
