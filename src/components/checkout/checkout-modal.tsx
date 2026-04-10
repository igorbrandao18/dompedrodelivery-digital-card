"use client";

import { useState, useEffect, useRef } from "react";
import type { Restaurant } from "@/lib/types";
import { useCartStore } from "@/stores/cart";
import { useCheckoutStore } from "@/stores/checkout";
import { useAuthStore } from "@/stores/auth";
import { SERVICE_FEE } from "@/lib/constants";
import { formatCurrency } from "@/lib/format";
import { ArrowLeft } from "lucide-react";
import { AddressMapPicker } from "@/components/address-map-picker";
import { PrimaryButton } from "@/components/ui/primary-button";
import { FulfillmentStep } from "./fulfillment-step";
import { AddressSelectStep } from "./address-select-step";
import { PaymentStep } from "./payment-step";
import { ReviewStep } from "./review-step";
import { ProcessingStep } from "./processing-step";

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

export function CheckoutModal({ restaurant, onClose, onSuccess }: CheckoutModalProps) {
  const addressSaveRef = useRef<(() => void) | null>(null);
  const [step, setStep] = useState<CheckoutStep>("fulfillment");

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
  const deliveryFee = getDeliveryFee(restaurant.deliveryFee);
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
        {step === "fulfillment" && (
          <FulfillmentStep
            fulfillmentMode={fulfillmentMode}
            deliveryTier={deliveryTier}
            selectedAddress={selectedAddress}
            restaurantDeliveryFee={restaurant.deliveryFee}
            onSetFulfillmentMode={setFulfillmentMode}
            onSetDeliveryTier={setDeliveryTier}
          />
        )}

        {step === "address-select" && (
          <AddressSelectStep
            addresses={addresses}
            selectedAddressId={selectedAddressId}
            loading={loading}
            error={error}
            userId={user?.id}
            onSelectAddress={setSelectedAddressId}
            onDeleteAddress={deleteAddress}
            onAddNew={() => setStep("address-form")}
          />
        )}

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

        {step === "payment" && (
          <PaymentStep
            paymentMethod={paymentMethod}
            cashChangeAmount={cashChangeAmount}
            onSetPaymentMethod={setPaymentMethod}
            onSetCashChangeAmount={setCashChangeAmount}
          />
        )}

        {step === "review" && (
          <ReviewStep
            lines={lines}
            fulfillmentMode={fulfillmentMode}
            selectedAddress={selectedAddress}
            paymentMethod={paymentMethod}
            cashChangeAmount={cashChangeAmount}
            subtotal={subtotal}
            deliveryFee={deliveryFee}
            total={total}
            error={error}
            restaurantName={restaurant.name}
            restaurantLogo={restaurant.logoUrl}
            estimatedMinutes={restaurant.estimatedDeliveryMinutes}
            deliveryTier={deliveryTier}
            onEditAddress={() => setStep(fulfillmentMode === "delivery" ? "address-select" : "fulfillment")}
            onEditPayment={() => setStep("payment")}
            onEditItems={onClose}
          />
        )}

        {(step === "processing" || step === "success") && (
          <ProcessingStep
            status={step}
            onViewOrders={() => {
              resetCheckout();
              onSuccess();
            }}
          />
        )}
      </div>

      {/* Bottom CTA */}
      {step === "fulfillment" && (
        <div className="border-t border-[#E5E7EB] px-4 py-3 shrink-0">
          <div className="px-4">
            <PrimaryButton onClick={handleContinueFromFulfillment}>
              Continuar
            </PrimaryButton>
          </div>
        </div>
      )}

      {step === "address-select" && (
        <div className="border-t border-[#E5E7EB] px-4 py-3 shrink-0">
          <div className="px-4">
            <PrimaryButton
              onClick={handleContinueFromAddress}
              disabled={!selectedAddressId}
            >
              Continuar
            </PrimaryButton>
          </div>
        </div>
      )}

      {step === "address-form" && (
        <div className="border-t border-[#E5E7EB] px-4 py-3 shrink-0">
          <PrimaryButton
            onClick={() => addressSaveRef.current?.()}
            loading={loading}
          >
            Salvar endereco
          </PrimaryButton>
        </div>
      )}

      {step === "payment" && (
        <div className="border-t border-[#E5E7EB] px-4 py-3 shrink-0">
          <div className="px-4">
            <PrimaryButton onClick={handleContinueFromPayment}>
              Continuar
            </PrimaryButton>
          </div>
        </div>
      )}

      {step === "review" && (
        <div className="border-t border-[#E5E7EB] px-4 py-3 shrink-0">
          <div className="px-4">
            <PrimaryButton
              onClick={handleSubmitOrder}
              loading={loading}
            >
              Fazer pedido · {formatCurrency(total)}
            </PrimaryButton>
          </div>
        </div>
      )}
    </div>
  );
}
