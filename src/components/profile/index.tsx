"use client";

import { useAuthStore } from "@/stores/auth";
import { ProfileLoginPrompt } from "./profile-login-prompt";
import { ProfileLoggedIn } from "./profile-logged-in";

interface ProfileTabProps {
  restaurantName: string;
  onLoginPress: () => void;
}

export function ProfileTab({ restaurantName, onLoginPress }: ProfileTabProps) {
  const user = useAuthStore((s) => s.user);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const logout = useAuthStore((s) => s.logout);
  const authed = isAuthenticated();

  if (!authed || !user) {
    return <ProfileLoginPrompt onLoginPress={onLoginPress} />;
  }

  return (
    <ProfileLoggedIn
      userName={user.name}
      userPhone={user.phone}
      restaurantName={restaurantName}
      onLogout={() => logout()}
    />
  );
}
