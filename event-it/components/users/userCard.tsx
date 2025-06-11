import {Profiles} from "@/types/exposed";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import {Avatar, AvatarImage} from "@/components/ui/avatar";
import {Label} from "@/components/ui/label";
import {useEffect, useState} from "react";
import {createClient} from "@/utils/supabase/client";

export default function UserCard({userId}: { userId: string}){
    const [user, setUser] = useState<Profiles | null>(null);

    useEffect(() => {
        async function fetchUser() {
            if (!userId) return;

            const supabase = createClient();
            const {data: user, error} = await supabase
                .from("profiles")
                .select("*")
                .eq("id", userId)
                .single();

            if (error) {
                console.error("Error fetching user:", error);
                return;
            }

            setUser(user);
        }
        fetchUser().then().catch(console.error);
    }, [userId]);

    if (!user){
        return <Card className="h-32 flex items-center justify-center">Lade Nutzer...</Card>;
    }
    return (
        <Card className={"w-full"}>
            <CardHeader>
                <Avatar>
                    <AvatarImage src={user.avatar_url ?? undefined}/>
                </Avatar>
                <CardTitle>{user.username}</CardTitle>
                <CardDescription>{user.first_name} {user.last_name}</CardDescription>
            </CardHeader>
            <CardContent>
                <Label>{user.bio}</Label>
                <Label className={(user.is_active ? "text-destructive-foreground" : "text-green-500")}>{user.is_active ? "Aktiv" : "Inaktiv"}</Label>
            </CardContent>
        </Card>
    );
}