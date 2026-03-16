interface SectionHeaderProps {
  badge?: string;
  title: string;
  description?: string;
  align?: "left" | "center";
  dark?: boolean;
  className?: string;
}

export function SectionHeader({
  badge,
  title,
  description,
  align = "center",
  dark = false,
  className = "",
}: SectionHeaderProps) {
  return (
    <div
      className={`${align === "center" ? "text-center mx-auto" : ""} max-w-3xl mb-16 ${className}`}
    >
      {badge && (
        <span
          className={`inline-flex items-center px-3 py-1 text-xs font-semibold rounded-full mb-4 ${
            dark
              ? "bg-white/10 text-white/80 border border-white/10"
              : "bg-brand-50 text-brand-700 border border-brand-100"
          }`}
        >
          {badge}
        </span>
      )}
      <h2
        className={`text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight mb-4 text-balance ${
          dark ? "text-white" : "text-navy-900"
        }`}
      >
        {title}
      </h2>
      {description && (
        <p
          className={`text-lg leading-relaxed ${
            dark ? "text-navy-300" : "text-navy-500"
          }`}
        >
          {description}
        </p>
      )}
    </div>
  );
}
