import AuthForm from "@/app/components/auth/auth-form";

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-10">
      <AuthForm mode="login" />
    </main>
  );
}
