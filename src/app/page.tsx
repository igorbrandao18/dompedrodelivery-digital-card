export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
      <div className="w-16 h-16 rounded-2xl bg-[#DC2626] flex items-center justify-center mb-4">
        <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" />
        </svg>
      </div>
      <h1 className="text-2xl font-extrabold text-gray-900">Dom Pedro Delivery</h1>
      <p className="text-sm text-gray-500 mt-2 max-w-sm">
        Este é o cardápio digital. Acesse pelo link do seu restaurante favorito.
      </p>
      <a
        href="https://dompedrodelivery.com.br"
        className="mt-6 inline-flex items-center gap-2 bg-[#DC2626] text-white px-6 py-3 rounded-xl text-sm font-semibold hover:bg-[#B91C1C] transition-colors"
      >
        Conhecer a plataforma
      </a>
    </div>
  );
}
