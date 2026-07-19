import { MinusIcon, PlusIcon } from "lucide-react";
import { Button } from "@/components/elements/Button";
import { Input } from "@/components/forms/Input";
import { Label } from "@/components/forms/Label";
import { Stack } from "@/components/layouts/Stack";

interface NumberStepperProps {
  id: string;
  label: string;
  // Controlled string buffer so the field can be cleared and typed freely
  value: string;
  // Fires per keystroke to update the buffer
  onValueChange: (raw: string) => void;
  // Fires on blur or Enter to parse, validate and apply
  onCommit: (raw: string) => void;
  // Direction is -1 for the minus button and 1 for the plus button
  onStep: (dir: 1 | -1) => void;
  step?: number;
  min?: number;
  max?: number;
}

// A labelled [-] [number] [+] control built from library primitives
// Owns no increment math, the parent decides how each control steps and clamps
export function NumberStepper({
  id,
  label,
  value,
  onValueChange,
  onCommit,
  onStep,
  step,
  min,
  max,
}: NumberStepperProps) {
  return (
    <Stack direction="horizontal" gap="xs" align="end">
      <Button
        type="button"
        variant="outline"
        size="icon"
        aria-label={`Decrease ${label}`}
        onClick={() => onStep(-1)}>
        <MinusIcon />
      </Button>
      <Stack gap="none" className="flex-1">
        <Label htmlFor={id} className="text-xs text-muted-foreground">
          {label}
        </Label>
        <Input
          id={id}
          type="number"
          inputMode="decimal"
          step={step}
          min={min}
          max={max}
          value={value}
          onChange={(e) => onValueChange(e.currentTarget.value)}
          onBlur={(e) => onCommit(e.currentTarget.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              onCommit(e.currentTarget.value);
            }
          }}
        />
      </Stack>
      <Button
        type="button"
        variant="outline"
        size="icon"
        aria-label={`Increase ${label}`}
        onClick={() => onStep(1)}>
        <PlusIcon />
      </Button>
    </Stack>
  );
}
