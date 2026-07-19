import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "./Command";

describe("Command", () => {
  it("renders the command root with data-slot=command", () => {
    const { container } = render(
      <Command>
        <CommandList>
          <CommandEmpty>None</CommandEmpty>
        </CommandList>
      </Command>,
    );
    expect(container.querySelector('[data-slot="command"]')).not.toBeNull();
  });

  it("renders compound parts with their data-slot attributes", () => {
    const { container } = render(
      <Command>
        <CommandInput placeholder="Search..." />
        <CommandList>
          <CommandEmpty>None</CommandEmpty>
          <CommandGroup heading="Group A">
            <CommandItem>Item A</CommandItem>
          </CommandGroup>
          <CommandSeparator />
          <CommandGroup heading="Group B">
            <CommandItem>
              Item B<CommandShortcut>⌘B</CommandShortcut>
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </Command>,
    );
    expect(container.querySelector('[data-slot="command-input"]')).not.toBeNull();
    expect(container.querySelector('[data-slot="command-list"]')).not.toBeNull();
    expect(container.querySelector('[data-slot="command-group"]')).not.toBeNull();
    expect(container.querySelector('[data-slot="command-item"]')).not.toBeNull();
    expect(container.querySelector('[data-slot="command-separator"]')).not.toBeNull();
    expect(container.querySelector('[data-slot="command-shortcut"]')).not.toBeNull();
  });
});
