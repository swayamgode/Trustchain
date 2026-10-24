import React from "react";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  hoverable?: boolean;
}

export default function Card({
  children,
  className = "",
  onClick,
  hoverable = false,
}: CardProps) {
  return (
    <div
      onClick={onClick}
      className={`bg-white border border-[#E8E9E5] rounded-[16px] p-5 lg:p-6 shadow-[0_2px_12px_rgba(16,20,24,0.035)] ${
        hoverable ? "interactive cursor-pointer hover:border-[#D9DCD5] hover:shadow-[0_6px_20px_rgba(16,20,24,0.06)]" : ""
      } ${className}`}
    >
      {children}
    </div>
  );
}
