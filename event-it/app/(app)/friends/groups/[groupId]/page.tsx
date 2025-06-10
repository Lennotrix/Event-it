import FriendGroupDetail from "@/components/friends/friendGroupDetail";

export default async function GroupsPage({ params }: { params: Promise<{groupId: string}> }) {
    return (
        <>
            <FriendGroupDetail groupId={(await params).groupId} />
        </>
    );
}