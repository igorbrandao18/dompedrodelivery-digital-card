"use client";

interface ProductHeroProps {
  imageUrl?: string | null;
  name: string;
  onClose: () => void;
}

function CloseButton({ onClose }: { onClose: () => void }) {
  return (
    <button
      type="button"
      onClick={onClose}
      className="absolute left-4 top-[env(safe-area-inset-top,12px)] mt-2 flex h-10 w-10 items-center justify-center rounded-full bg-black/45"
    >
      <svg
        className="h-6 w-6 text-white"
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
  );
}

export function ProductHero({ imageUrl, name, onClose }: ProductHeroProps) {
  if (imageUrl) {
    return (
      <div className="relative h-[280px] w-full flex-shrink-0 bg-[#E5E7EB]">
        <img
          src={imageUrl}
          alt={name}
          className="h-full w-full object-cover"
        />
        <CloseButton onClose={onClose} />
      </div>
    );
  }

  return (
    <div className="relative h-[120px] w-full flex-shrink-0 bg-[#F3F4F6]">
      <CloseButton onClose={onClose} />
    </div>
  );
}
