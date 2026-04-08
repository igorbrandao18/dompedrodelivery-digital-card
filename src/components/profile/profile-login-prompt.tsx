"use client";

import { User, ShoppingBag, MapPin } from "lucide-react";
import { LoginPromptHero } from "@/components/ui/login-prompt-hero";

interface ProfileLoginPromptProps {
  onLoginPress: () => void;
}

export function ProfileLoginPrompt({ onLoginPress }: ProfileLoginPromptProps) {
  return (
    <LoginPromptHero
      icon={User}
      title="Meu perfil"
      subtitle="Entre para acompanhar pedidos e salvar seus dados"
      benefitsLabel="Vantagens de ter uma conta"
      benefits={[
        {
          icon: ShoppingBag,
          title: "Acompanhe seus pedidos",
          desc: "Veja o status em tempo real",
        },
        {
          icon: MapPin,
          title: "Salve seus enderecos",
          desc: "Peca sem digitar tudo de novo",
        },
        {
          icon: User,
          title: "Perfil personalizado",
          desc: "Seus dados salvos para proximos pedidos",
        },
      ]}
      onLoginPress={onLoginPress}
    />
  );
}
