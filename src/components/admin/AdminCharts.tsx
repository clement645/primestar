"use client";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  BarChart,
  Bar,
} from "recharts";

export interface DailyPoint {
  date: string;
  clicks: number;
  whatsapp: number;
}

export function TrendChart({ data }: { data: DailyPoint[] }) {
  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e7f2e2" />
          <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="#14361f" />
          <YAxis tick={{ fontSize: 12 }} stroke="#14361f" allowDecimals={false} />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="clicks" name="Referral Clicks" stroke="#2f6b3a" strokeWidth={2} dot={false} />
          <Line type="monotone" dataKey="whatsapp" name="WhatsApp Clicks" stroke="#e0a527" strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export interface WorkerPoint {
  name: string;
  clicks: number;
  whatsapp: number;
}

export function WorkerPerformanceChart({ data }: { data: WorkerPoint[] }) {
  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e7f2e2" />
          <XAxis dataKey="name" tick={{ fontSize: 12 }} stroke="#14361f" />
          <YAxis tick={{ fontSize: 12 }} stroke="#14361f" allowDecimals={false} />
          <Tooltip />
          <Legend />
          <Bar dataKey="clicks" name="Referral Clicks" fill="#2f6b3a" radius={[4, 4, 0, 0]} />
          <Bar dataKey="whatsapp" name="WhatsApp Clicks" fill="#e0a527" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
