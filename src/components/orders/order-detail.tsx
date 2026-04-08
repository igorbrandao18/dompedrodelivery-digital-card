"use client";

import { useState } from "react";
import { ArrowLeft, Star, Package } from "lucide-react";
import { apiFetch } from "@/lib/api";
import type { OrderDetail as OrderDetailType } from "@/lib/types";
import { OrderReview } from "./order-review";
import { STATUS_CONFIG, formatDate } from "./order-constants";
import {
  OrderItemsList,
  OrderAddress,
  OrderPayment,
  OrderPriceSummary,
} from "./order-detail-sections";

interface OrderDetailProps {
  order: OrderDetailType;
  onBack: () => void;
}

export function OrderDetail({ order, onBack }: OrderDetailProps) {
  const [showReview, setShowReview] = useState(false);
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewComment, setReviewComment] = useState("");
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewSubmitted, setReviewSubmitted] = useState(false);
  const [reviewError, setReviewError] = useState<string | null>(null);

  const handleSubmitReview = async () => {
    if (reviewRating === 0) return;
    setReviewSubmitting(true);
    setReviewError(null);
    try {
      await apiFetch(`/orders/${order.id}/review`, {
        method: "POST",
        body: JSON.stringify({ rating: reviewRating, comment: reviewComment }),
      });
      setReviewSubmitted(true);
    } catch (err) {
      setReviewError(
        err instanceof Error ? err.message : "Erro ao enviar avaliação."
      );
    } finally {
      setReviewSubmitting(false);
    }
  };

  const status = STATUS_CONFIG[order.status] || {
    label: order.status,
    bg: "bg-gray-50",
    text: "text-gray-700",
    icon: Package,
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-4">
      {/* Back + title */}
      <div className="mb-4 flex items-center gap-3">
        <button
          type="button"
          onClick={onBack}
          className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-[#F3F4F6] transition-colors"
        >
          <ArrowLeft size={20} className="text-[#111827]" />
        </button>
        <h2 className="text-[18px] font-bold text-[#111827]">
          Pedido #{order.id.slice(0, 6)}
        </h2>
      </div>

      {/* Status card */}
      <div className={`rounded-[16px] ${status.bg} p-4 mb-4`}>
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white">
            <status.icon size={20} className={status.text} />
          </div>
          <div>
            <p className={`text-[16px] font-bold ${status.text}`}>
              {status.label}
            </p>
            <p className="text-[12px] text-[#6B7280]">
              {formatDate(order.createdAt)}
            </p>
          </div>
        </div>
      </div>

      <OrderItemsList items={order.items} />
      {order.deliveryAddress && <OrderAddress address={order.deliveryAddress} />}
      {order.paymentMethod && <OrderPayment method={order.paymentMethod} />}
      <OrderPriceSummary
        subtotal={order.subtotal}
        deliveryFee={order.deliveryFee}
        total={order.total}
      />

      {/* Review button */}
      {order.status === "DELIVERED" && !showReview && !reviewSubmitted && (
        <button
          type="button"
          onClick={() => setShowReview(true)}
          className="flex w-full items-center justify-center gap-2 rounded-[12px] bg-[#DC2626] px-4 py-3 text-[16px] font-bold text-white transition-colors hover:bg-[#B91C1C]"
        >
          <Star size={18} />
          Avaliar pedido
        </button>
      )}

      {(showReview || reviewSubmitted) && (
        <OrderReview
          rating={reviewRating}
          comment={reviewComment}
          submitting={reviewSubmitting}
          submitted={reviewSubmitted}
          error={reviewError}
          onRatingChange={setReviewRating}
          onCommentChange={setReviewComment}
          onSubmit={handleSubmitReview}
        />
      )}
    </div>
  );
}
