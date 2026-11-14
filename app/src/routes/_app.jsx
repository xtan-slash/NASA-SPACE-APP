import { createFileRoute, Outlet } from "@tanstack/react-router";
import Layout from "@/components/Layout";
import { AuthGateError, requireSignedIn } from "@/components/auth/AuthGate";

export const Route = createFileRoute("/_app")({
  ssr: false,
  beforeLoad: requireSignedIn,
  errorComponent: AuthGateError,
  component: AppLayout,
});

function AppLayout() {
  return (
    <Layout>
      <Outlet />
    </Layout>
  );
}