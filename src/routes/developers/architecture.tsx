import { createFileRoute } from "@tanstack/react-router";
import { DeveloperDocument } from "@/components/developers/DeveloperDocs";

export const Route = createFileRoute("/developers/architecture")({
  component: () => <DeveloperDocument guide="architecture" />,
});
