import { createFileRoute } from "@tanstack/react-router";

import { DeveloperDocument } from "@/components/developers/DeveloperDocs";

export const Route = createFileRoute("/developers/data-pipeline")({
  component: () => <DeveloperDocument guide="data-pipeline" />,
});
