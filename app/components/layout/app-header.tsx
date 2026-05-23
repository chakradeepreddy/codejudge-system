import Link from "next/link";
import SignOutButton from "@/app/components/auth/sign-out-button";
import ThemeToggle from "@/app/components/theme/theme-toggle";

type AppHeaderProps = {
  userEmail?: string;
  subtitle: string;
  rightSlot?: React.ReactNode;
};

export default function AppHeader({ userEmail, subtitle, rightSlot }: AppHeaderProps) {
  return (
    <header className="sticky top-0 z-50 border-b border-token bg-header/90 backdrop-blur-xl">
      <div className="mx-auto flex h-16 w-full max-w-[1600px] items-center justify-between gap-3 px-4 sm:px-6">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-accent/30 bg-accent-soft text-sm font-semibold text-accent">
            CJ
          </div>
          <div>
            <p className="text-sm font-semibold tracking-wide text-token-primary">CodeJudge</p>
            <p className="text-xs text-token-secondary">{subtitle}</p>
          </div>
        </div>

        <nav className="hidden items-center gap-2 md:flex">
          <Link href="/" className="nav-link">Workspace</Link>
          <Link href="/problems" className="nav-link">Problems</Link>
          <Link href="/leaderboard" className="nav-link">Leaderboard</Link>
        </nav>

        <div className="flex items-center gap-2 sm:gap-3">
          {rightSlot}
          <ThemeToggle />
          {userEmail ? (
            <span className="hidden max-w-[220px] truncate text-sm text-token-secondary lg:inline">
              {userEmail}
            </span>
          ) : null}
          <SignOutButton />
        </div>
      </div>
    </header>
  );
}
