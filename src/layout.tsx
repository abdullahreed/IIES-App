import React from "react";
import { Link, useLocation } from "wouter";
import { Users, BookOpen, NotebookPen, LayoutDashboard } from "lucide-react";

export function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();

  const navItems = [
    { href: "/", label: "Dashboard", icon: LayoutDashboard },
    { href: "/contacts", label: "Contacts", icon: Users },
    { href: "/courses", label: "Courses", icon: BookOpen },
    { href: "/notes", label: "Notes", icon: NotebookPen },
  ];

  return (
    <div className="min-h-[100dvh] flex flex-col md:flex-row bg-background">
      {/* Sidebar */}
      <aside className="w-full md:w-60 border-b md:border-b-0 md:border-r border-sidebar-border bg-sidebar flex-shrink-0">
        <div className="p-6 md:p-7 flex items-center gap-3">
          <img src="/iies-logo.jpeg" alt="IIES" className="w-11 h-11 rounded object-cover" />
          <h1 className="text-xl font-medium tracking-tight text-sidebar-foreground">
            IIES Tarbiyah
          </h1>
        </div>

        <nav className="px-3 md:px-4 pb-6 md:pb-8 flex flex-row md:flex-col gap-0.5 overflow-x-auto md:overflow-x-visible">
          {navItems.map((item) => {
            const isActive = location === item.href || (item.href !== "/" && location.startsWith(item.href));
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-md transition-colors text-sm shrink-0 md:shrink ${
                  isActive
                    ? "bg-sidebar-primary text-sidebar-primary-foreground font-medium"
                    : "text-sidebar-foreground/65 hover:bg-sidebar-accent hover:text-sidebar-foreground font-light"
                }`}
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto bg-background">
        <div className="max-w-4xl mx-auto w-full">
          {children}
        </div>
      </main>
    </div>
  );
}
