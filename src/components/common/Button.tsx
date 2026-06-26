import type { ButtonHTMLAttributes, ReactNode } from "react";

type Variant = "primary" | "secondary" | "ghost" | "danger";

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: "sm" | "md";
  icon?: ReactNode;
  iconOnly?: boolean;
}

export function Button({
  variant = "primary",
  size = "md",
  icon,
  iconOnly,
  children,
  className = "",
  ...rest
}: Props) {
  const classes = [
    "tm-btn",
    `tm-btn-${variant}`,
    size === "sm" ? "tm-btn-sm" : "",
    iconOnly ? "tm-btn-icon" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");
  return (
    <button className={classes} {...rest}>
      {icon}
      {!iconOnly && children}
    </button>
  );
}
