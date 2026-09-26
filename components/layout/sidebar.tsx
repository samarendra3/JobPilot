import Link from "next/link";
import { Rocket } from "lucide-react";
import NavList from "@/components/layout/nav-list";
import LogoutButton from "@/components/layout/logout-button";

export default function Sidebar() {
  return (
    <aside className="hidden md:fixed md:inset-y-0 md:left-0 md:z-30 md:flex md:w-64 md:flex-col md:border-r md:border-border md:bg-card">
      <div className="flex h-16 items-center gap-2 border-b border-border px-6">
        <Rocket aria-hidden="true" className="h-5 w-5 text-foreground" />
        <Link href="/dashboard" className="text-base font-semibold text-foreground">
          JobPilot
        </Link>
      </div>

      <div className="flex flex-1 flex-col justify-between overflow-y-auto px-3 py-4">
        <NavList />
        <div className="border-t border-border pt-3">
          <LogoutButton />
        </div>
      </div>
    </aside>
  );
}
