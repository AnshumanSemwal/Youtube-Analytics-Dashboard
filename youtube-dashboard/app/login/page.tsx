import type { Metadata } from "next";
import LoginButton from "@/components/LoginButton";

export const metadata: Metadata = {
  title:  "Sign In",
  robots: { index: false },
};

export default function LoginPage() {
  return <LoginButton />;
}