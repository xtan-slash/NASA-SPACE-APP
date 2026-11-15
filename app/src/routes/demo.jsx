import { createFileRoute, Outlet } from "@tanstack/react-router";
import DemoLayout from "@/components/demo/DemoLayout";

// Public, read-only demonstration of the rotation lab. The pages render the static
// dataset in src/lib/demo-data.js — the demo makes no database reads or writes, so a
// visitor can never see or change another user's farm, climate or scenario records.
export const Route = createFileRoute("/demo")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "TerraShift AI demo | Climate-Smart Agriculture" },
      {
        name: "description",
        content:
          "Explore a read-only TerraShift AI demonstration: a sample farm, recorded NASA POWER climate summary, and three crop rotation scenarios scored on soil, water, climate and diversity.",
      },
    ],
  }),
  component: DemoShell,
});

function DemoShell() {
  return (
    <DemoLayout>
      <Outlet />
    </DemoLayout>
  );
}