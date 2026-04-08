"use client";

import { MessageSquare } from "lucide-react";

interface CustomerNotesProps {
  value: string;
  onChange: (value: string) => void;
}

export function CustomerNotes({ value, onChange }: CustomerNotesProps) {
  return (
    <div className="border-t border-[#E5E7EB] px-4 py-4">
      <div className="mb-2 flex items-center justify-between">
        <div className="flex items-center gap-2 text-[14px] font-bold text-[#111827]">
          <MessageSquare className="h-4 w-4" />
          Observações
        </div>
        <span className="text-[12px] text-[#6B7280]">{value.length}/500</span>
      </div>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Ex: tirar cebola, sem gelo..."
        maxLength={500}
        rows={3}
        className="w-full resize-none rounded-[12px] border border-[#E5E7EB] px-3 py-2 text-[14px] text-[#111827] placeholder-[#9CA3AF] outline-none focus:border-[#DC2626] focus:ring-1 focus:ring-[#DC2626]"
      />
    </div>
  );
}
