import { useEffect } from "react";
import { useNavigate, useRouterState } from "@tanstack/react-router";

// Opens a page's "New" modal when it's visited with ?create=1 (e.g. from a
// command-palette quick action), then strips the param so it fires exactly once.
// Pass the route's own `create` search param (from Route.useSearch()); every wired
// page must include `create?: string` in its validateSearch so the param survives.
export function useNewIntent(createParam: string | undefined, open: () => void) {
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  useEffect(() => {
    if (!createParam) return;
    open();
    navigate({ to: pathname, replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [createParam]);
}
