import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { type AriaAttributes, useState } from "react";
import { Calendar } from "@/components/composites/Calendar";
import { Button } from "@/components/elements/Button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/elements/Popover";
import { cn } from "@/lib/utils";

/*
 * Composes Calendar + Popover + Button into the canonical shadcn DatePicker
 * recipe. Controlled (pass `date` + `onDateChange`) or uncontrolled
 * (omit both; the component tracks its own state). The trigger button
 * shows the formatted date or a placeholder; the popover surfaces the
 * Calendar in `mode="single"` for picking a single day
 */
interface DatePickerProps {
  /** Controlled date value. */
  date?: Date | undefined;
  /** Controlled change handler. */
  onDateChange?: (date: Date | undefined) => void;
  /** Placeholder shown when no date is selected. */
  placeholder?: string;
  /** date-fns format string for the trigger label. */
  dateFormat?: string;
  /** Additional Tailwind classes merged onto the trigger button. */
  className?: string;
  /** Disable the trigger; the popover cannot open. */
  disabled?: boolean;
  /** Mark the trigger invalid for form-validation styling. */
  "aria-invalid"?: AriaAttributes["aria-invalid"];
}

function DatePicker({
  date: dateProp,
  onDateChange,
  placeholder = "Pick a date",
  dateFormat = "PPP",
  className,
  disabled,
  "aria-invalid": ariaInvalid,
}: DatePickerProps) {
  const isControlled = dateProp !== undefined || onDateChange !== undefined;
  const [internal, setInternal] = useState<Date | undefined>();
  const date = isControlled ? dateProp : internal;
  const handleSelect = (next: Date | undefined) => {
    if (!isControlled) setInternal(next);
    onDateChange?.(next);
  };

  return (
    <Popover>
      <PopoverTrigger
        render={
          <Button
            data-slot="date-picker-trigger"
            variant="outline"
            disabled={disabled}
            aria-invalid={ariaInvalid}
            className={cn(
              "w-[240px] justify-start text-left font-normal",
              !date && "text-muted-foreground",
              className,
            )}>
            <CalendarIcon />
            {date ? format(date, dateFormat) : <span>{placeholder}</span>}
          </Button>
        }
      />
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar mode="single" selected={date} onSelect={handleSelect} autoFocus />
      </PopoverContent>
    </Popover>
  );
}

export { DatePicker, type DatePickerProps };
