"use client";

import {
  DialogTitle,
  DialogFooter,
  DialogHeader,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { toast } from "sonner";
import { createClient } from "@/utils/supabase/client";
import { Label } from "@/components/ui/label";

export default function EditUserPopup({
  onCloseAction,
  userId,
  currentValues,
}: {
  onCloseAction: () => void;
  userId: string;
  currentValues: {
    username?: string;
    avatar_url?: string;
    first_name?: string;
    last_name?: string;
    bio?: string;
  };
}) {
  const [username, setUsername] = useState(currentValues.username || "");
  const [avatarUrl, setAvatarUrl] = useState(currentValues.avatar_url || "");
  const [firstName, setFirstName] = useState(currentValues.first_name || "");
  const [lastName, setLastName] = useState(currentValues.last_name || "");
  const [bio, setBio] = useState(currentValues.bio || "");
  const [showImage, setShowImage] = useState(true);

  async function handleEditUser() {
    const supabase = createClient();
    const { error } = await supabase
      .from("profiles")
      .update({
        username,
        avatar_url: avatarUrl,
        first_name: firstName,
        last_name: lastName,
        bio,
      })
      .eq("id", userId);

    if (error) {
      toast.error("Fehler beim Aktualisieren: " + error.message);
    } else {
      toast.success("Benutzer aktualisiert!");
      onCloseAction();
    }
    window.location.reload();
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle>Benutzer bearbeiten</DialogTitle>
      </DialogHeader>

      <div className="space-y-2">
        <Label>Benutzername</Label>
        <Input
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Benutzername"
        />

        <Label>Avatar URL</Label>
        <div className="flex items-center gap-4">
          {avatarUrl && showImage && (
            <img
              src={avatarUrl}
              alt="Avatar Vorschau"
              className="w-16 h-16 rounded-full object-cover border"
              onError={() => setShowImage(false)}
            />
          )}
          <Input
            value={avatarUrl}
            onChange={(e) => {
              setAvatarUrl(e.target.value);
              setShowImage(true);
            }}
            placeholder="https://..."
            className="flex-1"
          />
        </div>

        <Label>Vorname</Label>
        <Input
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          placeholder="Vorname"
        />

        <Label>Nachname</Label>
        <Input
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
          placeholder="Nachname"
        />

        <Label>Biografie</Label>
        <Input
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          placeholder="Kurzbiografie"
        />
      </div>

      <DialogFooter className="mt-4">
        <Button onClick={handleEditUser}>Speichern</Button>
        <Button variant="outline" onClick={onCloseAction}>
          Abbrechen
        </Button>
      </DialogFooter>
    </>
  );
}
