import { createFileRoute } from "@tanstack/react-router";
import MethodContent from "@/components/method/MethodContent";

export const Route = createFileRoute("/method")({
  component: MethodContent,
});