import { createFileRoute } from "@tanstack/react-router";
import MethodContent from "@/components/method/MethodContent";

export const Route = createFileRoute("/methodology")({
  head: () => ({
    meta: [
      { title: "Method & limits · TerraShift AI" },
      {
        name: "description",
        content: "Full scoring formulas, constants, NASA POWER attribution and the explicit limitations of this prototype.",
      },
    ],
  }),
  component: () => <MethodContent backTo="/" />,
});