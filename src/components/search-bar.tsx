"use client";

import { useState, useEffect, useRef } from "react";
import { Search, X } from "lucide-react";

interface SearchBarProps {
  value: string;
  onChange: (v: string) => void;
}

export function SearchBar({ value, onChange }: SearchBarProps) {
  const [local, setLocal] = useState(value);
  const timerRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    setLocal(value);
  }, [value]);

  const handleChange = (v: string) => {
    setLocal(v);
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => onChange(v), 300);
  };

  useEffect(() => () => clearTimeout(timerRef.current), []);

  return (
    <div className="sticky top-0 z-20 bg-white pb-4 pt-3">
      <div className="relative px-4">
        <Search className="absolute left-7 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6B7280]" />
        <input
          type="text"
          value={local}
          onChange={(e) => handleChange(e.target.value)}
          placeholder="Buscar no cardápio"
          className="h-12 w-full rounded-[12px] border border-[#E5E7EB] bg-white pl-10 pr-10 text-[14px] text-[#111827] placeholder-[#6B7280] outline-none focus:border-[#DC2626] focus:ring-1 focus:ring-[#DC2626]"
        />
        {local && (
          <button
            type="button"
            onClick={() => handleChange("")}
            className="absolute right-7 top-1/2 -translate-y-1/2 flex h-5 w-5 items-center justify-center rounded-full bg-[#6B7280] text-white hover:bg-[#4B5563] transition-colors"
          >
            <X className="h-3 w-3" />
          </button>
        )}
      </div>
    </div>
  );
}
