import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "tertiary" | "destructive";
  size?: "sm" | "md" | "lg";
  icon?: React.ReactNode;
  children: React.ReactNode;
}

export default function Button({
  variant = "primary",
  size = "md",
  icon,
  children,
  className = "",
  disabled,
  ...props
}: ButtonProps) {
  let variantStyles = "";
  if (variant === "primary") {
    variantStyles =
      "bg-[#111410] text-white hover:bg-[#282C27] active:bg-[#111410] border border-[#111410] shadow-sm";
  } else if (variant === "secondary") {
    variantStyles =
      "bg-white text-[#101418] border border-[#E8E9E5] hover:bg-[#F2F3EF] hover:border-[#D9DCD5] active:bg-[#E8E9E5]";
  } else if (variant === "tertiary") {
    variantStyles =
      "bg-transparent text-[#626971] hover:text-[#101418] hover:bg-[#F2F3EF]";
  } else if (variant === "destructive") {
    variantStyles =
      "bg-[#C0392B] text-white hover:bg-[#A93226] border border-[#C0392B]";
  }

  let sizeStyles = "h-[42px] px-4 text-[14px]";
  if (size === "sm") {
    sizeStyles = "h-[36px] px-3 text-[13px]";
  } else if (size === "lg") {
    sizeStyles = "h-[48px] px-6 text-[15px]";
  }

  return (
    <button
      className={`inline-flex items-center justify-center gap-2 font-medium rounded-[12px] whitespace-nowrap shrink-0 interactive disabled:opacity-50 disabled:cursor-not-allowed ${variantStyles} ${sizeStyles} ${className}`}
      disabled={disabled}
      {...props}
    >
      {icon && <span className="inline-flex shrink-0">{icon}</span>}
      <span>{children}</span>
    </button>
  );
}
