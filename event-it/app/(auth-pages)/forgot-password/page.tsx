import {forgotPasswordAction} from "@/app/(auth-pages)/actions";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {Button} from "@/components/ui/button";
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
              Know your password?
              <Button variant="link" asChild>
                <a href="/sign-in">Sign in</a>
              </Button>
            </>
          }
          formAction={forgotPasswordAction}
          submitLabel="Change password"
          message={message}
      >
        <Label htmlFor="email">Email</Label>
        <Input name="email" placeholder="you@example.com" required/>
      </AuthCard>
  );
}
