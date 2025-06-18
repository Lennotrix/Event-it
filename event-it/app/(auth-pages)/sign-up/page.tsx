import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import {Button} from "@/components/ui/button";
import {AuthCard} from "@/components/auth/authCard";
import {signUpAction} from "@/app/(auth-pages)/actions";
import {getAuthMessage} from "@/utils/auth/authMessage";


export default async function SignupPage({
                                       searchParams,
                                   }: {
    searchParams?: Promise<{ [key: string]: string | string[] }>;
}) {
    const redirectTo = (await searchParams)?.redirect ?? "/";
    const message = getAuthMessage(await searchParams);


    return (
        <AuthCard
            title="Registrierung"
            description={
                <>
                    Hast du bereits einen Account?
                    <Button variant="link" asChild>
                        <a href="/sign-in">Einloggen</a>
                    </Button>
                </>
            }
            formAction={signUpAction}
            submitLabel="Sign up"
            message={message}
            >
            <Label htmlFor="username">Benutzername</Label>
            <Input name="username" placeholder="Benutzername" required/>
            <Label htmlFor="name">Vorname</Label>
            <Input name="name" placeholder="Vorname" required/>
            <Label htmlFor="lastname">Nachname</Label>
            <Input name="lastname" placeholder="Nachname" required/>
            <Label htmlFor="email">Email</Label>
            <Input name="email" placeholder="beispiel@email.com" required/>

            <Label htmlFor="password">Password</Label>
            <Input
                type="password"
                name="password"
                placeholder="Dein Passwort"
                minLength={6}
                required
            />
            <input type="hidden" name="redirect" value={redirectTo}/>
        </AuthCard>
    );
}
