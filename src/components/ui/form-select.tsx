import { useState, Children, isValidElement, type ReactElement, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Radix SelectItem does not allow value="". Map empty string to/from this sentinel.
const EMPTY = "__none__";
const toR = (v: string) => (v === "" ? EMPTY : v);
const fromR = (v: string) => (v === EMPTY ? "" : v);

interface FormSelectProps {
  value?: string;
  defaultValue?: string;
  name?: string;
  onChange?: React.ChangeEventHandler<HTMLSelectElement>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onBlur?: (...args: any[]) => void;
  children: ReactNode;
  className?: string;
  disabled?: boolean;
  placeholder?: string;
  id?: string;
  "aria-describedby"?: string;
  "aria-invalid"?: boolean | "false" | "true";
}

export function FormSelect({
  value,
  defaultValue,
  name,
  onChange,
  onBlur,
  children,
  className,
  disabled,
  placeholder,
  id,
  "aria-describedby": ariaDescribedBy,
  "aria-invalid": ariaInvalid,
}: FormSelectProps) {
  const isControlled = value !== undefined;
  const [uncontrolled, setUncontrolled] = useState<string>(defaultValue ?? "");
  const current = isControlled ? value! : uncontrolled;

  const options = Children.toArray(children)
    .filter(isValidElement)
    .map((child) => {
      const el = child as ReactElement<{ value?: string | number; children: ReactNode; disabled?: boolean }>;
      return {
        value: String(el.props.value ?? ""),
        label: el.props.children,
        disabled: el.props.disabled,
      };
    });

  const noneOption = options.find((o) => o.value === "");

  const handleChange = (v: string) => {
    const real = fromR(v);
    if (!isControlled) setUncontrolled(real);
    onChange?.({ target: { value: real } } as unknown as React.ChangeEvent<HTMLSelectElement>);
  };

  return (
    <>
      {name && <input type="hidden" name={name} value={current} />}
      <Select
        value={toR(current)}
        onValueChange={handleChange}
        disabled={disabled}
        onOpenChange={(open) => { if (!open) onBlur?.(); }}
      >
        <SelectTrigger
          id={id}
          aria-describedby={ariaDescribedBy}
          aria-invalid={ariaInvalid}
          className={cn(
            "h-8 w-full rounded-md border border-border bg-surface px-2.5 text-[12.5px] focus:ring-1 focus:ring-primary",
            className,
          )}
        >
          <SelectValue
            placeholder={noneOption ? String(noneOption.label) : (placeholder ?? "Select…")}
          />
        </SelectTrigger>
        <SelectContent>
          {noneOption && (
            <SelectItem value={EMPTY} className="text-[12.5px]">
              {noneOption.label}
            </SelectItem>
          )}
          {options
            .filter((o) => o.value !== "")
            .map((opt) => (
              <SelectItem
                key={opt.value}
                value={opt.value}
                disabled={opt.disabled}
                className="text-[12.5px]"
              >
                {opt.label}
              </SelectItem>
            ))}
        </SelectContent>
      </Select>
    </>
  );
}
