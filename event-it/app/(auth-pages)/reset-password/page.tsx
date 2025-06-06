import {resetPasswordAction} from "@/app/(auth-pages)/actions";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {AuthCard} from "@/components/auth/authCard";
import {getAuthMessage} from "@/utils/auth/authMessage";

export default async function ForgotPassword({
                                                 searchParams,
                                             }: {
    searchParams?: Promise<{ [key: string]: string | string[] }>;
}) {
    const message = getAuthMessage(await searchParams);

    return (
        <AuthCard
            title="Forgot password?"
            description={
                <>
                    Resetting your password?
                </>
            }
            formAction={resetPasswordAction}
            submitLabel="Change password"
            message={message}
        >
            <Label htmlFor="password">Password</Label>
            <Input name="password" placeholder="Your Password" type="password" required minLength={6}/>

            <Label htmlFor="confirmPassword">Confirm your password</Label>
            <Input name="confirmPassword" placeholder="Your Password" type="password" required minLength={6}/>
        </AuthCard>
    );
}
