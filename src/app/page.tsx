import AuthLayout from "./(auth)/auth/layout";
import LoginPage from "./(auth)/auth/login/page";

export default function Home() {
  return (
    <AuthLayout>
      <LoginPage />
    </AuthLayout>
  );
}
