"use client";

import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from "@/components/ui/navigation-menu";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Image from "next/image";
import {Fragment, useEffect, useState} from "react";
import { createClient } from "@/utils/supabase/client";
import { Button } from "../ui/button";
import { useRouter } from "next/navigation";
import {Avatar, AvatarImage} from "@/components/ui/avatar";
import {Breadcrumbs} from "@/components/navigationMenu/breadcrumps";
import {ThemeToggle} from "@/components/navigationMenu/themeToggle";
import {Label} from "@/components/ui/label";

export default function TopNav() {
  const [userData, setUserData] = useState<{
    username: string;
    avatar_url: string;
  } | null>(null);

  const router = useRouter();

  useEffect(() => {
    const fetchUser = async () => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        const { data, error } = await supabase
          .from("profiles")
          .select("username, avatar_url")
          .eq("id", user.id)
          .single();

        if (!error && data) {
          setUserData({
            username: data.username,
            avatar_url: data.avatar_url ?? "/fallback.png",
          });
        }
      }
    };

    fetchUser();
  }, []);

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    location.reload();
  };

  return (
    <header className="w-full flex items-center justify-between p-4 border-b">
      <div className="flex items-center justify-between gap-4">
        <div className="text-xl font-bold">
          <Image src="/main.png" alt="Logo" width={55} height={55} />
        </div>
        <div className="hidden md:block">
          <Breadcrumbs />
        </div>
      </div>

      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => router.push("/kalender")}>
            Kalendar
          </Button>
          <Button variant="outline" onClick={() => router.push("/events")}>
            Events
          </Button>
        </div>

        <ThemeToggle />

        {userData && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <div className="">
                  <Avatar>
                    <AvatarImage src={userData.avatar_url}></AvatarImage>
                  </Avatar>
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 p-4">
                <DropdownMenuItem className="text-sm text-muted-foreground" disabled>
                  <Label>
                    Eingeloggt als: {userData.username}
                  </Label>
                </DropdownMenuItem>
                <DropdownMenuItem>
                    Profil bearbeiten (bald)
                </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleLogout}>Ausloggen</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
        )}
      </div>

    </header>
  );
}
