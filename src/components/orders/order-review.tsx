"use client";

import { Star } from "lucide-react";
import { ErrorAlert } from "@/components/ui/error-alert";

interface OrderReviewProps {
  rating: number;
  comment: string;
  submitting: boolean;
  submitted: boolean;
  error: string | null;
  onRatingChange: (rating: number) => void;
  onCommentChange: (comment: string) => void;
  onSubmit: () => void;
}

export function OrderReview({
  rating,
  comment,
  submitting,
  submitted,
  error,
  onRatingChange,
  onCommentChange,
  onSubmit,
}: OrderReviewProps) {
  if (submitted) {
    return (
      <div className="rounded-2xl bg-green-50 p-5 text-center mb-4">
        <Star
          size={28}
          className="mx-auto mb-2 fill-[#FBBF24] text-[#FBBF24]"
        />
        <p className="text-[15px] font-bold text-green-800">
          Avaliacao enviada! Obrigado.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl bg-white shadow-[0_1px_4px_rgba(0,0,0,0.08)] p-4 space-y-4 mb-4">
      <p className="text-[16px] font-bold text-[#111827] text-center">
        Como foi seu pedido?
      </p>
      <div className="flex items-center justify-center gap-3">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onRatingChange(star)}
            className="transition-transform hover:scale-110"
          >
            <Star
              size={36}
              className={
                star <= rating
                  ? "fill-[#FBBF24] text-[#FBBF24]"
                  : "text-[#D1D5DB]"
              }
            />
          </button>
        ))}
      </div>
      <textarea
        placeholder="Conte como foi sua experiencia (opcional)"
        value={comment}
        onChange={(e) => onCommentChange(e.target.value)}
        rows={3}
        maxLength={500}
        className="w-full rounded-xl border border-[#E5E7EB] bg-white px-4 py-3 text-[14px] text-[#111827] placeholder-[#9CA3AF] outline-none focus:border-[#DC2626] focus:ring-1 focus:ring-[#DC2626] resize-none"
      />
      {error && <ErrorAlert message={error} />}
      <button
        type="button"
        onClick={onSubmit}
        disabled={rating === 0 || submitting}
        className="flex h-12 w-full items-center justify-center rounded-xl bg-[#DC2626] text-[15px] font-bold text-white transition-colors hover:bg-[#B91C1C] disabled:opacity-[0.45]"
      >
        {submitting ? "Enviando..." : "Enviar avaliacao"}
      </button>
    </div>
  );
}
