import FriendGroupTop from "@/components/friends/friendGroupTop";

export default function Layout({ children }: { children: React.ReactNode }) {
    return (
        <div className="pt-10 px-4 max-w-screen">
            <FriendGroupTop/>
            <div className={"w-full border-t border-2 my-2"}></div>
            {children}
        </div>
    );

}