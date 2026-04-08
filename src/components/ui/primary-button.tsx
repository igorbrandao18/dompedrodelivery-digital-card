import React from "react";

interface PrimaryButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean;
}

export function PrimaryButton({
  children,
  loading,
  disabled,
  ...props
}: PrimaryButtonProps) {
  return (
    <button
      type="button"
      disabled={disabled || loading}
      {...props}
      className={`flex h-12 w-full items-center justify-center rounded-[12px] bg-[#DC2626] text-[15px] font-bold text-white transition-colors hover:bg-[#B91C1C] disabled:opacity-[0.45] ${props.className || ""}`}
    >
      {loading ? (
        <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24" fill="none">
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
          />
        </svg>
      ) : (
        children
      )}
    </button>
  );
}
