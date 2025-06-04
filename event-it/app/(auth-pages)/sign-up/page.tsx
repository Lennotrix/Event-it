import {signUpAction} from "@/app/(auth-pages)/actions";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import {Button} from "@/components/ui/button";
import {AuthCard} from "@/components/auth/authCard";

export default async function SignupPage({
                                       searchParams,
                                   }: {
    searchParams?: Promise<{ [key: string]: string | string[] }>;
}) {
    const redirectTo = (await searchParams)?.redirect ?? "/";

    return (
        <AuthCard
            title="Sign up"
            description={
                <>
                    Already have an account?
                    <Button variant="link" asChild>
                        <a href="/sign-in">Sign in</a>
                    </Button>
                </>
            }
            formAction={signUpAction}
            submitLabel="Sign up"
        >
            <Label htmlFor="email">Email</Label>
            <Input name="email" placeholder="you@example.com" required/>

            <Label htmlFor="password">Password</Label>
            <Input
                type="password"
                name="password"
                placeholder="Your password"
                minLength={6}
                required
            />
            <input type="hidden" name="redirect" value={redirectTo}/>
        </AuthCard>
    );
}
