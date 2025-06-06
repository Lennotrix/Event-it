import {createClient} from "@/utils/supabase/server";
import {Card} from "@/components/ui/card";
import UserList from "@/components/users/userList";

export default async function FriendGroupDetail({groupId}: { groupId: string }) {
    const supabase = await createClient();

    const {data: group, error} = await supabase
        .from("friend_groups")
        .select("*")
        .eq("id", groupId)
        .single();

    const {data: members, error: membersError} = await supabase.from("friend_group_members").select("*").eq("group_id", groupId);

    if (error || membersError || !members || !group) {
        console.error("Error fetching group or members:", error || membersError);
        return <Card className="h-32 flex items-center justify-center">Fehler beim Laden der Gruppe.</Card>;
    }

    return (
        <div className={"w-full grid grid-cols-[2fr_1fr] grid-rows-[2fr_1fr] gap-x-[10px] gap-y-[10px]"}>
            <Card className={"col-start-1 row-start-1"}>

            </Card>
            <div className={"col-start-2 row-start-1"}>
                <UserList userIds={members.map(member => member.user_id)} groupId={groupId}/>
            </div>
        </div>
  );

}