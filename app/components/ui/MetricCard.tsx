import React from "react";

interface MetricCardProps {
  label: string;
  value: string;
  trend?: string;
  trendPositive?: boolean;
  icon: React.ReactNode;
  iconBg?: string;
  iconColor?: string;
}

export default function MetricCard({
  label,
  value,
  trend,
  trendPositive = true,
  icon,
  iconBg = "bg-[#EFFBCB]",
  iconColor = "text-[#172000]",
}: MetricCardProps) {
  return (
    <div className="bg-white border border-[#E8E9E5] rounded-[16px] p-5 shadow-[0_2px_12px_rgba(16,20,24,0.035)] flex flex-col justify-between">
      <div className="flex items-center justify-between mb-3">
        <span className="text-[13px] font-medium text-[#626971] tracking-tight">{label}</span>
        <div
          className={`w-9 h-9 rounded-[10px] flex items-center justify-center ${iconBg} ${iconColor} shrink-0`}
        >
          {icon}
        </div>
      </div>
      <div>
        <div className="text-[32px] font-extrabold text-[#101418] tracking-tight leading-none mb-2">
          {value}
        </div>
        {trend && (
          <div className="text-[12px] text-[#626971] flex items-center gap-1.5">
            <span
              className={`font-semibold ${
                trendPositive ? "text-[#159447]" : "text-[#B95B12]"
              }`}
            >
              {trend}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
