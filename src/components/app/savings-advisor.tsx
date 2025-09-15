'use client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import type { SavingsTip } from '@/lib/types';
import { Lightbulb, TrendingUp } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

type SavingsAdvisorProps = {
  tips: SavingsTip[];
};

export default function SavingsAdvisor({ tips }: SavingsAdvisorProps) {
  return (
    <Card className="glass h-full">
      <CardHeader>
        <div className="flex items-center gap-2">
            <Lightbulb className="h-6 w-6 text-primary" />
            <CardTitle>AI Savings Advisor</CardTitle>
        </div>
        <CardDescription>Personalized tips to boost your savings.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {tips.map((tip, index) => (
            <div key={index} className="flex items-start gap-4 p-3 rounded-lg bg-primary/5">
              <div className="flex-shrink-0 bg-green-500/10 text-green-400 p-2 rounded-full">
                <TrendingUp className="h-5 w-5" />
              </div>
              <div>
                <p className="font-semibold text-foreground">
                  {tip.tip}
                </p>
                <p className="text-sm font-bold text-green-400">
                  Estimated Savings: {formatCurrency(tip.estimatedSavings)}/month
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
