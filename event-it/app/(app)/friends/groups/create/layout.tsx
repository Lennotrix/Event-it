import FriendGroupTop from "@/components/friends/friendGroupTop";

export default function Layout({ children }: { children: React.ReactNode }) {
    return (
        <div className="mt-10 px-4 flex items-center justify-center">
            {children}
        </div>
    );

}