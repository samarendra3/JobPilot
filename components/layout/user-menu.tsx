"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import LogoutButton from "@/components/layout/logout-button";
import { cn } from "@/lib/utils";
import type { PublicUser } from "@/types/user";

interface UserMenuProps {
  user: PublicUser;
}

function getInitials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

export default function UserMenu({ user }: UserMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const onClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsOpen(false);
    };

    document.addEventListener("mousedown", onClickOutside);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onClickOutside);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [isOpen]);

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setIsOpen((open) => !open)}
        aria-haspopup="menu"
        aria-expanded={isOpen}
        aria-label={`Open user menu for ${user.name}`}
        className="flex items-center gap-2 rounded-md px-2 py-1.5 hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <span
          aria-hidden="true"
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground"
        >
          {getInitials(user.name) || "?"}
        </span>
        <span className="hidden text-left sm:block">
          <span className="block text-sm font-medium text-foreground">{user.name}</span>
          <span className="block text-xs text-muted-foreground">{user.email}</span>
        </span>
        <ChevronDown aria-hidden="true" className="h-4 w-4 text-muted-foreground" />
      </button>

      {isOpen && (
        <div
          role="menu"
          aria-label="User menu"
          className={cn(
            "absolute right-0 z-50 mt-2 w-56 rounded-md border border-border bg-card py-1 shadow-md"
          )}
        >
          <div className="border-b border-border px-3 py-2 sm:hidden">
            <p className="text-sm font-medium text-foreground">{user.name}</p>
            <p className="text-xs text-muted-foreground">{user.email}</p>
          </div>
          <Link
            href="/dashboard/profile"
            role="menuitem"
            onClick={() => setIsOpen(false)}
            className="block px-3 py-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            Profile
          </Link>
          <Link
            href="/dashboard/settings"
            role="menuitem"
            onClick={() => setIsOpen(false)}
            className="block px-3 py-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            Settings
          </Link>
          <div className="mt-1 border-t border-border pt-1">
            <LogoutButton variant="menu-item" className="px-3" />
          </div>
        </div>
      )}
    </div>
  );
}
