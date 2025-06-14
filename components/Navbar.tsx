"use client";
import React, { useEffect, useState } from "react";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from "@/components/ui/navigation-menu";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { User, Bolt, LogOut } from "lucide-react";
const menuItems = [
  { label: "🏠 Home", href: "/" },
  { label: "📖 Courses", href: "/courses" },
  { label: "Testimonials", href: "/testimonials" },
  { label: "Billing", href: "/billing" },
];

import { useSession, signOut } from "next-auth/react";

const Navbar = () => {
  const { data: session, status } = useSession();
  const [isSubscribed, setisSubscribed] = useState(false);

  useEffect(() => {
  if (session?.user.razorpayCustomerId) {
    setisSubscribed(true);
  }
}, [session]);


  return (
    <nav className="w-full fixed top-0 left-0 z-50 px-8 py-4 bg-white/10 backdrop-blur-md border-b border-white/20 text-white shadow-lg">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        
        <div className="text-2xl font-bold tracking-tight text-white flex items-center">
          🚀 MyWebsite
        </div>

        {/* Navigation Menu */}
        <NavigationMenu>
          <NavigationMenuList className="flex gap-6">
            {menuItems.map((item) => {
              if (item.label === "Billing" && !isSubscribed) return null;

              return (
                <NavigationMenuItem key={item.label}>
                  <NavigationMenuLink asChild>
                    <Link
                      href={item.href}
                      className={cn(
                        "text-lg font-medium text-white/80 hover:text-white transition-colors px-3 py-2 rounded-md"
                      )}
                    >
                      {item.label}
                    </Link>
                  </NavigationMenuLink>
                </NavigationMenuItem>
              );
            })}
          </NavigationMenuList>
        </NavigationMenu>

        {/* Optional Action / CTA */}
        <div className=" flex items-center gap-4 text-sm text-white">
          {/* Login Button */}

          {status === "unauthenticated" && (
            <Link href="/auth/login">
              <Button className="bg-gradient-to-r from-purple-700 to-fuchsia-600 hover:from-purple-800 hover:to-fuchsia-700 text-white font-medium px-4 py-2 rounded-lg shadow-md transition duration-300">
                Login
              </Button>
            </Link>
          )}

          {/* Premium Button */}

          {status === "authenticated" && isSubscribed && (
            <Button className="bg-gradient-to-r from-fuchsia-600 to-purple-700 hover:from-fuchsia-700 hover:to-purple-800 text-white font-medium px-4 py-2 rounded-lg shadow-md transition duration-300">
              ✨ Premium
            </Button>
          )}

          {/* Avatar Dropdown */}

          {status === "authenticated" && (
            <DropdownMenu>
              <DropdownMenuTrigger className="p-1.5 bg-white/10 backdrop-blur-md rounded-full hover:bg-white/20 transition-colors border border-white/20">
                <Avatar>
                  <AvatarImage src="https://github.com/shadcn.png" />
                  <AvatarFallback className="text-white bg-fuchsia-700">
                    CN
                  </AvatarFallback>
                </Avatar>
              </DropdownMenuTrigger>

              <DropdownMenuContent className="bg-gradient-to-b from-purple-950 via-fuchsia-800 to-purple-950 border border-white/10 text-white shadow-xl">
                <DropdownMenuLabel className="text-fuchsia-300">
                  {session?.user?.name}
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-white/20" />
                <DropdownMenuItem className="flex items-center gap-2 hover:bg-fuchsia-700/30">
                  <User className="w-4 h-4 text-fuchsia-400" /> Profile
                </DropdownMenuItem>
                <DropdownMenuItem className="flex items-center gap-2 hover:bg-fuchsia-700/30">
                  <Bolt className="w-4 h-4 text-fuchsia-400" /> Settings
                </DropdownMenuItem>

                <DropdownMenuItem
                  onClick={() => {
                    signOut({ callbackUrl: "/" });
                    console.log("its logged out");
                  }}
                  className="flex items-center gap-2 text-red-400 hover:bg-red-500/20"
                >
                  <LogOut className="w-4 h-4" /> Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
