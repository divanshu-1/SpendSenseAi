'use client';

import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card } from '@/components/ui/card';
import type { Category } from '@/lib/types';
import { formatCurrency } from '@/lib/utils';

type CategoryPieChartProps = {
  data: { [key in Category]?: number };
};

const COLORS = [
  'hsl(var(--chart-1))',
  'hsl(var(--chart-2))',
  'hsl(var(--chart-3))',
  'hsl(var(--chart-4))',
  'hsl(var(--chart-5))',
  '#f59e0b',
  '#10b981',
];

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <Card className="p-2">
        <p className="font-semibold">{`${payload[0].name}`}</p>
        <p className="text-sm text-primary">{`${formatCurrency(payload[0].value)}`}</p>
        <p className="text-xs text-muted-foreground">{`(${(payload[0].percent * 100).toFixed(2)}%)`}</p>
      </Card>
    );
  }
  return null;
};

export default function CategoryPieChart({ data }: CategoryPieChartProps) {
  const chartData = Object.entries(data).map(([name, value]) => ({
    name,
    value,
  }));

  if (chartData.length === 0) {
    return (
        <div className="flex items-center justify-center h-80 text-muted-foreground">
            No data to display.
        </div>
    )
  }

  return (
    <div style={{ width: '100%', height: 300 }}>
      <ResponsiveContainer>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            labelLine={false}
            outerRadius={100}
            fill="#8884d8"
            dataKey="value"
            nameKey="name"
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend
            iconSize={10}
            formatter={(value) => <span className="text-foreground/80">{value}</span>}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
