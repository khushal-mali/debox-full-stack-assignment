"use client";

import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogOut, Menu, Package, List, Upload, UserPlus } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useState } from "react";
import { toast } from "sonner";

export function Sidebar() {
  const { user, logout, isLoading } = useAuth();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const navItems = [
    { href: "/products", label: "Products", icon: Package, roles: ["MASTER", "ADMIN"] },
    { href: "/categories", label: "Categories", icon: List, roles: ["MASTER", "ADMIN"] },
    { href: "/inventory", label: "Inventory", icon: Package, roles: ["MASTER", "ADMIN"] },
    { href: "/upload", label: "CSV Upload", icon: Upload, roles: ["MASTER"] },
    { href: "/signup", label: "Register User", icon: UserPlus, roles: ["MASTER"] },
  ];

  // Filter navigation items based on user role
  const filteredNavItems = navItems.filter((item) =>
    user ? item.roles.includes(user.role) : false
  );

  // Sidebar content
  const sidebarContent = (
    <div className="flex flex-col h-full bg-background">
      <div className="p-4">
        <h2 className="text-xl font-bold">Admin Panel</h2>
      </div>
      {isLoading ? (
        <div className="p-4">Loading...</div>
      ) : user ? (
        <nav className="flex-1 space-y-2 p-4">
          {filteredNavItems.length ? (
            filteredNavItems.map((item) => (
              <Link key={item.href} href={item.href} onClick={() => setOpen(false)}>
                <Button
                  variant={pathname === item.href ? "secondary" : "ghost"}
                  className="w-full justify-start text-left"
                >
                  <item.icon className="mr-2 h-4 w-4" />
                  {item.label}
                </Button>
              </Link>
            ))
          ) : (
            <div className="p-4 text-muted-foreground">No accessible pages</div>
          )}
        </nav>
      ) : (
        <nav className="flex-1 space-y-2 p-4">
          <Link href="/login" onClick={() => setOpen(false)}>
            <Button variant="ghost" className="w-full justify-start text-left">
              Login
            </Button>
          </Link>
        </nav>
      )}
      {user && (
        <div className="p-4 border-t">
          <Button
            variant="ghost"
            className="w-full justify-start text-left"
            onClick={() => {
              logout();
              setOpen(false);
              toast.success("Logged out successfully");
            }}
          >
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </div>
      )}
    </div>
  );

  return (
    <>
      <div className="hidden md:block w-64 bg-background border-r">{sidebarContent}</div>
      <div className="md:hidden p-4">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon">
              <Menu className="h-4 w-4" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-64 p-0">
            {sidebarContent}
          </SheetContent>
        </Sheet>
      </div>
    </>
  );
}
