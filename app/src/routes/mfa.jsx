import { createFileRoute } from "@tanstack/react-router";
import { MfaPage } from "@/components/auth/MfaPage";

export const Route = createFileRoute("/mfa")({
  ssr: false,
  head: () => ({ meta: [{ title: "Two-factor authentication · TerraShift AI" }] }),
  component: MfaPage,
});