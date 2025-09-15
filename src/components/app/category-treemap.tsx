'use client';

import { Treemap, ResponsiveContainer, Tooltip } from 'recharts';
import { Card } from '@/components/ui/card';
import type { Category } from '@/lib/types';
import { formatCurrency } from '@/lib/utils';
import { useMemo } from 'react';

type CategoryTreemapProps = {
  data: { [key in Category]?: number };
};

const COLORS = [
  '#f59e0b',
  '#10b981',
  '#3b82f6',
  '#8b5cf6',
  '#ec4899',
  '#f43f5e',
  '#84cc16',
];

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <Card className="p-3">
        <p className="font-semibold text-lg">{data.name}</p>
        <p className="text-primary font-bold text-xl">{formatCurrency(data.value)}</p>
      </Card>
    );
  }
  return null;
};

const CustomizedContent = (props: any) => {
  const { root, depth, x, y, width, height, index, name, value } = props;
  const colors = COLORS;

  // Only render labels for top-level categories
  if (depth > 1) {
    return null;
  }
  
  const isLargeEnough = width > 80 && height > 40;

  return (
    <g>
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        style={{
          fill: colors[index % colors.length],
          stroke: '#fff',
          strokeWidth: 2 / (depth + 1e-10),
          strokeOpacity: 1 / (depth + 1e-10),
        }}
      />
      {isLargeEnough && (
        <text
          x={x + width / 2}
          y={y + height / 2 + 7}
          textAnchor="middle"
          fill="#fff"
          fontSize={14}
          className="font-semibold"
        >
          {name}
        </text>
      )}
       {isLargeEnough && (
         <text
          x={x + width / 2}
          y={y + height / 2 + 25}
          textAnchor="middle"
          fill="#fff"
          fontSize={12}
          className="font-bold"
        >
          {formatCurrency(value)}
        </text>
       )}
    </g>
  );
};


export default function CategoryTreemap({ data }: CategoryTreemapProps) {
  const chartData = useMemo(() => Object.entries(data)
    .map(([name, value]) => ({
      name,
      value: value || 0,
    }))
    .sort((a, b) => b.value - a.value), [data]);

  if (chartData.length === 0) {
    return (
        <div className="flex items-center justify-center h-80 text-muted-foreground">
            No data to display.
        </div>
    )
  }

  return (
    <div style={{ width: '100%', height: 400 }}>
      <ResponsiveContainer>
        <Treemap
          data={chartData}
          dataKey="value"
          ratio={4 / 3}
          stroke="#fff"
          fill="hsl(var(--primary))"
          content={CustomizedContent as any}
        >
          <Tooltip content={<CustomTooltip />} />
        </Treemap>
      </ResponsiveContainer>
    </div>
  );
}
