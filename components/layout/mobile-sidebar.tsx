"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Menu, X, Rocket } from "lucide-react";
import NavList from "@/components/layout/nav-list";
import LogoutButton from "@/components/layout/logout-button";
import { useUIStore } from "@/stores/ui-store";

export default function MobileSidebar() {
  const isOpen = useUIStore((state) => state.sidebarOpen);
  const openSidebar = useUIStore((state) => state.openSidebar);
  const closeSidebar = useUIStore((state) => state.closeSidebar);
  const pathname = usePathname();
  const [prevPathname, setPrevPathname] = useState(pathname);

  if (pathname !== prevPathname) {
    setPrevPathname(pathname);
    closeSidebar();
  }

  useEffect(() => {
    if (!isOpen) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeSidebar();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [isOpen, closeSidebar]);

  return (
    <div className="md:hidden">
      <button
        type="button"
        onClick={() => openSidebar()}
        aria-label="Open navigation menu"
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        className="rounded-md p-2 text-muted-foreground hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <Menu aria-hidden="true" className="h-5 w-5" />
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-40">
          <div
            className="fixed inset-0 bg-foreground/40"
            onClick={() => closeSidebar()}
            aria-hidden="true"
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Dashboard navigation"
            className="fixed inset-y-0 left-0 flex w-72 max-w-[85vw] flex-col bg-card shadow-lg"
          >
            <div className="flex h-16 items-center justify-between border-b border-border px-4">
              <div className="flex items-center gap-2">
                <Rocket aria-hidden="true" className="h-5 w-5 text-foreground" />
                <span className="text-base font-semibold text-foreground">JobPilot</span>
              </div>
              <button
                type="button"
                onClick={() => closeSidebar()}
                aria-label="Close navigation menu"
                className="rounded-md p-2 text-muted-foreground hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <X aria-hidden="true" className="h-5 w-5" />
              </button>
            </div>

            <div className="flex flex-1 flex-col justify-between overflow-y-auto px-3 py-4">
              <NavList onNavigate={() => closeSidebar()} />
              <div className="border-t border-border pt-3">
                <LogoutButton />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
