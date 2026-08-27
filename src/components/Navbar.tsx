"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FileText, User, Sparkles, MessageSquare, TrendingUp, BadgeCheck } from "lucide-react";

export default function Navbar() {
  const pathname = usePathname();

  const links = [
    { href: "/", label: "Home", icon: FileText },
    { href: "/profile", label: "Profile", icon: User },
    { href: "/generate", label: "Generate", icon: Sparkles },
    { href: "/interview", label: "Interview", icon: MessageSquare },
    { href: "/skill-gap", label: "Skill Gap", icon: TrendingUp },
    { href: "/linkedin", label: "LinkedIn", icon: BadgeCheck },
  ];

  return (
    <nav className="no-print border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <FileText className="w-6 h-6 text-primary" />
          <span className="font-bold text-lg">ResumeCraft</span>
        </Link>
        <div className="flex items-center gap-1">
          {links.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                pathname === href
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
}
