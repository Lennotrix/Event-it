import FriendGroupTop from "@/components/friends/friendGroupTop";

export default function Layout({ children }: { children: React.ReactNode }) {
    return (
        <div className="px-4 max-w-screen mt-2">
            <FriendGroupTop/>
            <div className={"w-full border-t border-2 my-4"}></div>
            {children}
        </div>
    );

}