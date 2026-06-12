import { Toaster as Sonner } from "sonner";

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      position="bottom-right"
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-elevated group-[.toaster]:text-foreground group-[.toaster]:border group-[.toaster]:border-hairline group-[.toaster]:shadow-[0_4px_24px_rgba(0,0,0,0.4)] group-[.toaster]:text-[13px]",
          description: "group-[.toast]:text-muted-foreground group-[.toast]:text-[12px]",
          actionButton: "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
          cancelButton: "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
