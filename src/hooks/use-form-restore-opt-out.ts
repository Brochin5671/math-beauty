import * as React from "react";

/**
 * Stop a browser restoring a library control's hidden input behind React's back
 *
 * Base UI's Switch, Checkbox and Radio each render a native input beside the visible
 * control. A browser restores its `checked` on history traversal (not on reload, which is
 * why a reload test misses it) and nothing reconciles it, so the control is dead on its
 * first press after Back. Making it controlled does not help: React only reconciles the
 * input on a change that moves state, and this one does not
 *
 * Set rather than passed, because Base UI exposes the input through `inputRef`; a caller's
 * own ref is merged. Wire this into any uncontrolled control that renders a hidden input
 * (`Toggle`, `NumberField` and `Slider` were checked and render none)
 */
export function useFormRestoreOptOut(
  callerRef?: React.Ref<HTMLInputElement>,
): React.RefCallback<HTMLInputElement> {
  return React.useCallback(
    (node: HTMLInputElement | null) => {
      node?.setAttribute("autocomplete", "off");
      if (typeof callerRef === "function") callerRef(node);
      else if (callerRef) callerRef.current = node;
    },
    [callerRef],
  );
}
