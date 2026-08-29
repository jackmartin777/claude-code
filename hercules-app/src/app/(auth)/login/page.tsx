import type { Metadata } from "next";
import { LoginForm } from "@/components/app/auth-form";

export const metadata: Metadata = {
  title: "Sign in",
  description: "Sign in to your Hercules workspace.",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ prompt?: string }>;
}) {
  const { prompt } = await searchParams;
  return <LoginForm prompt={typeof prompt === "string" ? prompt : ""} />;
}
