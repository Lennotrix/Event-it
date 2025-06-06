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
import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { Button } from "../ui/button";
import { useRouter } from "next/navigation";

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
      {/* Logo links */}
      <div className="text-xl font-bold">
        <Image src="/main.png" alt="Logo" width={75} height={75} />
      </div>

      {/* Mittlere Buttons */}
      <div className="flex items-center gap-4">
        <Button variant="outline" onClick={() => router.push("/kalender")}>
          Kalendar
        </Button>
        <Button variant="outline" onClick={() => router.push("/events")}>
          Events
        </Button>
      </div>

      {/* Benutzer-Avatar rechts */}
      {userData && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="p-0">
              <div className="w-20 h-20 rounded-full overflow-hidden">
                <img
                  src={userData.avatar_url}
                  alt="Profilbild"
                  width={75}
                  height={75}
                  className="object-cover w-full h-full"
                />
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <div className="px-3 py-2 text-sm text-muted-foreground">
              Eingeloggt als
              <br />
              <span className="font-medium text-black">
                {userData.username}
              </span>
            </div>
            <DropdownMenuItem onClick={handleLogout}>Logout</DropdownMenuItem>
            <DropdownMenuItem disabled>
              Profil bearbeiten (bald)
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </header>
  );
}
