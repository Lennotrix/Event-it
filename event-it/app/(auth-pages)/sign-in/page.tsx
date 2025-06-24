import {signInAction} from "@/app/(auth-pages)/actions";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import {Button} from "@/components/ui/button";
import {AuthCard} from "@/components/auth/authCard";
import {getAuthMessage} from "@/utils/auth/authMessage";

export default async function SignInPage({
                                             searchParams,
                                         }: {
    searchParams?: Promise<{ [key: string]: string | string[] }>;
}) {
    const message = getAuthMessage(await searchParams);
    const redirectTo = (await searchParams)?.redirect ?? "/";

    return (
        <AuthCard
            title="Einloggen"
            description={
                <>
                    Noch kein Konto?
                    <Button variant="link" asChild>
                        <a href="/sign-up">Konto erstellen</a>
                    </Button>
                </>
            }
            formAction={signInAction}
            submitLabel="Einloggen"
            message={message}
        >
            <Label htmlFor="email">Email</Label>
            <Input name="email" placeholder="beispiel@email.com" required/>

            <div className={"flex flex-col"}>
                <div className="flex justify-between items-center">
                    <Label htmlFor="password">Passwort</Label>
                    <Button variant="link" asChild>
                        <a href={"/forgot-password"}>Passwort vergessen?</a>
                    </Button>
                </div>
                <Input
                    type="password"
                    name="password"
                    placeholder="Dein Passwort"
                    minLength={6}
                    required
                />

            </div>
            <input type="hidden" name="redirect" value={redirectTo}/>
        </AuthCard>
    );
}
