import Link from "next/link";

interface CardProps {
  children: React.ReactNode;
  href?: string;
  className?: string;
  hover?: boolean;
  padding?: "sm" | "md" | "lg";
}

export function Card({
  children,
  href,
  className = "",
  hover = true,
  padding = "md",
}: CardProps) {
  const paddings = {
    sm: "p-5",
    md: "p-6 lg:p-8",
    lg: "p-8 lg:p-10",
  };

  const baseClasses = `bg-white rounded-2xl border border-navy-200/60 shadow-premium transition-all duration-300 ${
    paddings[padding]
  } ${hover ? "hover:shadow-premium-lg hover:border-navy-200 hover:-translate-y-0.5" : ""} ${className}`;

  if (href) {
    return (
      <Link href={href} className={`block ${baseClasses}`}>
        {children}
      </Link>
    );
  }

  return <div className={baseClasses}>{children}</div>;
}
