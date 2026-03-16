"use client";

import { Link } from "@/i18n/routing";

interface ButtonProps {
  variant?: "primary" | "secondary" | "ghost" | "white";
  size?: "sm" | "md" | "lg";
  href?: string;
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

export function Button({
  variant = "primary",
  size = "md",
  href,
  children,
  className = "",
  onClick,
}: ButtonProps) {
  const baseStyles =
    "inline-flex items-center justify-center font-semibold rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2";

  const variants = {
    primary:
      "text-white bg-gradient-to-r from-brand-600 to-brand-700 hover:from-brand-700 hover:to-brand-800 shadow-md hover:shadow-lg focus:ring-brand-500",
    secondary:
      "text-navy-700 bg-white border border-navy-200 hover:bg-navy-50 hover:border-navy-300 focus:ring-brand-500",
    ghost:
      "text-navy-600 hover:text-navy-900 hover:bg-navy-100 focus:ring-brand-500",
    white:
      "text-navy-900 bg-white hover:bg-navy-50 shadow-md hover:shadow-lg focus:ring-white",
  };

  const sizes = {
    sm: "px-4 py-2 text-sm",
    md: "px-6 py-3 text-sm",
    lg: "px-8 py-4 text-base",
  };

  const classes = `${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`;

  if (href) {
    return (
      <Link href={href as "/"} className={classes}>
        {children}
      </Link>
    );
  }

  return (
    <button onClick={onClick} className={classes}>
      {children}
    </button>
  );
}
