"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";

const navLinks = [
  { href: "/profile",   label: "Profile",   icon: "📄" },
  { href: "/dashboard", label: "Readiness", icon: "🎯" },
  { href: "/roadmap",   label: "Roadmap",   icon: "🗺️" },
  { href: "/optimizer", label: "Optimizer", icon: "✨" },
  { href: "/editor",    label: "Editor",    icon: "✍️" },
];

export default function Navbar() {
  const pathname = usePathname();
  const { data: session } = useSession();

  // Don't show navbar on login page or home page
  if (pathname === "/login" || pathname === "/") return null;

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-white/10 bg-zinc-950/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link
            href="/"
            className="text-lg font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-white to-zinc-400 hover:to-white transition-all shrink-0"
          >
            GetMeTheJob
          </Link>

          {/* Nav Links */}
          <div className="hidden sm:flex items-center gap-1">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
                    isActive
                      ? "bg-white/10 text-white border border-white/20 shadow-inner"
                      : "text-zinc-400 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <span className="text-base">{link.icon}</span>
                  {link.label}
                </Link>
              );
            })}
          </div>

          {/* User + Sign out */}
          <div className="flex items-center gap-3">
            {session?.user && (
              <span className="hidden md:block text-xs text-zinc-500 font-medium truncate max-w-[140px]">
                {session.user.email}
              </span>
            )}
            <button
              onClick={() => signOut({ callbackUrl: "/" })}
              className="text-xs font-semibold text-zinc-400 hover:text-white border border-white/10 hover:border-white/20 px-3 py-1.5 rounded-lg transition-all"
            >
              Sign out
            </button>
          </div>
        </div>

        {/* Mobile Nav */}
        <div className="sm:hidden flex gap-1 pb-2 overflow-x-auto">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                  isActive
                    ? "bg-white/10 text-white border border-white/20"
                    : "text-zinc-400 hover:text-white hover:bg-white/5"
                }`}
              >
                <span>{link.icon}</span>
                {link.label}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
