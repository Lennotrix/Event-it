"use client"

import {ScrollArea} from "@/components/ui/scroll-area";
import {Card, CardContent, CardFooter, CardHeader, CardTitle} from "@/components/ui/card";
import UserCard from "@/components/users/userCard";
import {Button} from "@/components/ui/button";
import {Plus} from "lucide-react";
import {createClient} from "@/utils/supabase/client";
import {usePopup} from "@/components/provider/popupProvider";
import AddUserPopup from "@/components/users/addUserPopup";

export default function UserList({userIds, groupId}: { userIds: string[], groupId: string }) {
    const {openPopup, closePopup } = usePopup();

    async function handleAddUser() {
        if (!groupId) {
            console.error("Group ID is required to add a user.");
            return;
        }

        openPopup(<AddUserPopup onCloseAction={closePopup} groupId={groupId}/>);
    }

    return(
        <Card className={"max-w-1/4"}>
            <CardHeader>
                <CardTitle>Mitglieder</CardTitle>
            </CardHeader>

            <CardContent>
                <ScrollArea>
                    {userIds.map((userId) => (
                        <UserCard key={userId} userId={userId} />
                    ))}
                </ScrollArea>
            </CardContent>
            <CardFooter className={"flex items-center justify-center"}>
                <Button variant={"outline"} onClick={handleAddUser}><Plus/></Button>
            </CardFooter>
        </Card>
    )
}