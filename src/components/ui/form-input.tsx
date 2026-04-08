import React from "react";

interface FormInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

export function FormInput({ label, ...props }: FormInputProps) {
  return (
    <div>
      <label className="mb-1.5 block text-[13px] font-medium text-[#374151]">
        {label}
      </label>
      <input
        {...props}
        className={`w-full h-12 rounded-[12px] border border-[#E5E7EB] bg-white px-4 text-[14px] text-[#111827] placeholder-[#9CA3AF] outline-none focus:border-[#DC2626] focus:ring-1 focus:ring-[#DC2626] transition-colors ${props.className || ""}`}
      />
    </div>
  );
}
