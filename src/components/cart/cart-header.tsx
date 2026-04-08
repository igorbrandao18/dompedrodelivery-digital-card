"use client";

interface CartHeaderProps {
  hasItems: boolean;
  onClose: () => void;
  onClear: () => void;
}

export function CartHeader({ hasItems, onClose, onClear }: CartHeaderProps) {
  return (
    <div className="flex items-center justify-between border-b border-[#E5E7EB] px-2 py-3">
      <div className="min-w-[72px]">
        <button
          type="button"
          onClick={onClose}
          className="flex h-8 w-8 items-center justify-center rounded-full text-[#DC2626] transition-colors hover:bg-[#F3F4F6]"
        >
          <svg
            className="h-7 w-7"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </button>
      </div>
      <h2 className="text-[14px] font-bold tracking-wide text-[#111827] uppercase">
        Sacola
      </h2>
      <div className="min-w-[72px] flex justify-end">
        {hasItems ? (
          <button
            type="button"
            onClick={onClear}
            className="text-[14px] font-semibold text-[#DC2626] hover:text-[#B91C1C] transition-colors"
          >
            Limpar
          </button>
        ) : (
          <div className="w-2" />
        )}
      </div>
    </div>
  );
}
