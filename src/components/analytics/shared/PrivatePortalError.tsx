import { useRouter } from "@tanstack/react-router";

import { PortalState } from "./PortalState";

export function PrivatePortalError({
  reset,
  internal = false,
}: {
  error: Error;
  reset: () => void;
  internal?: boolean;
}) {
  const router = useRouter();

  return (
    <PortalState
      kind="error"
      internal={internal}
      title="This analytics view didn’t load"
      message="The rest of your private session is still available. Retry this view, or refresh the page if the issue continues."
      action={{
        label: "Try again",
        onClick: () => {
          router.invalidate();
          reset();
        },
      }}
    />
  );
}
