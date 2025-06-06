import {Button} from "@/components/ui/button";
import {Plus} from "lucide-react";
import {Label} from "@/components/ui/label";

export default function FriendGroupTop() {
    return(
        <div className={"flex items-center justify-between"}>
            <Label className={"text-2xl font-semibold"}>Freundesgruppen</Label>
            <Button className={"whitespace-nowrap"}>
                <a href={"/friends//groups/create"}
                   className={"flex items-center gap-2"}><Plus/> Neue Gruppe erstellen</a>
            </Button>
        </div>
    )
}