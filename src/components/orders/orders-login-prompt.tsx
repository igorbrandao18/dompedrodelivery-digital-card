"use client";

import { ClipboardList, Clock, Star, ShoppingBag } from "lucide-react";
import { LoginPromptHero } from "@/components/ui/login-prompt-hero";

interface OrdersLoginPromptProps {
  onLoginPress: () => void;
}

export function OrdersLoginPrompt({ onLoginPress }: OrdersLoginPromptProps) {
  return (
    <LoginPromptHero
      icon={ClipboardList}
      title="Meus pedidos"
      subtitle="Entre para acompanhar seus pedidos em tempo real"
      benefitsLabel="Acompanhe tudo"
      benefits={[
        {
          icon: Clock,
          title: "Status em tempo real",
          desc: "Saiba quando seu pedido esta sendo preparado",
        },
        {
          icon: Star,
          title: "Avalie seus pedidos",
          desc: "Ajude a melhorar a experiencia",
        },
        {
          icon: ShoppingBag,
          title: "Historico completo",
          desc: "Veja todos os pedidos anteriores",
        },
      ]}
      onLoginPress={onLoginPress}
    />
  );
}
