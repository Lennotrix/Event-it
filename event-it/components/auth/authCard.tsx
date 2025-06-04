import {ReactNode} from "react";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {Button} from "@/components/ui/button";
import {AuthMessage} from "@/types/auth/authTypes";

type AuthCardProps = {
    title: string;
    description?: ReactNode;
    children: ReactNode;
    formAction: any;
    submitLabel: string;
    message?: AuthMessage;
};

export function AuthCard({
                             title,
                             description,
                             children,
                             formAction,
                             submitLabel,
                             message,
                         }: AuthCardProps) {
    return (
        <Card className="w-full max-w-xs">
            <CardHeader>
                <CardTitle>{title}</CardTitle>
                {description && <CardDescription>{description}</CardDescription>}
            </CardHeader>
            <form action={formAction}>
                <CardContent className="flex flex-col gap-2">
                    {message && (
                        <div
                            className={`text-sm p-2 rounded ${
                                message.type === "error" ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"
                            }`}
                        >
                            {message.text}
                        </div>
                    )}
                    {children}
                </CardContent>
                <CardFooter>
                    <Button type={"submit"}>{submitLabel}</Button>
                </CardFooter>
            </form>
        </Card>
    );
}
