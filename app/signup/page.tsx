import AuthForm from "@/app/components/auth/auth-form";

export default function SignupPage() {
  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-10">
      <AuthForm mode="signup" />
    </main>
  );
}
