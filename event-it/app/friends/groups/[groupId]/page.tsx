import FriendGroupDetail from "@/components/friends/friendGroupDetail";

export default async function GroupsPage({ params }: { params: {groupId: string} }) {
    return (
        <>
            <FriendGroupDetail groupId={(await params).groupId} />
        </>
    );
}