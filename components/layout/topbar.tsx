import MobileSidebar from "@/components/layout/mobile-sidebar";
import UserMenu from "@/components/layout/user-menu";
import type { PublicUser } from "@/types/user";

interface TopbarProps {
  user: PublicUser;
}

export default function Topbar({ user }: TopbarProps) {
  return (
    <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-border bg-card px-4 md:px-8">
      <div className="flex items-center gap-3">
        <MobileSidebar />
        <span className="text-sm font-medium text-foreground md:hidden">JobPilot</span>
      </div>

      <UserMenu user={user} />
    </header>
  );
}
