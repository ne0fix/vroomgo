"use client";

import { LogOut } from "lucide-react";
import { signOut } from "next-auth/react";

export function LogoutButton() {
  return (
    <button
      type="button"
      onClick={() => signOut({ callbackUrl: "/" })}
      className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-red-500 transition-colors"
    >
      <LogOut className="w-4 h-4" />
      Sair
    </button>
  );
}