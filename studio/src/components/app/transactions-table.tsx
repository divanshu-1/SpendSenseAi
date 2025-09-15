'use client';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { AnnotatedTransaction } from '@/lib/types';
import { formatCurrency, cn } from '@/lib/utils';
import {
  Car,
  HeartPulse,
  MoreHorizontal,
  ReceiptText,
  ShoppingCart,
  Sparkles,
  Ticket,
  UtensilsCrossed,
  AlertTriangle,
} from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

const categoryIcons = {
  Food: <UtensilsCrossed className="h-4 w-4" />,
  Transport: <Car className="h-4 w-4" />,
  Shopping: <ShoppingCart className="h-4 w-4" />,
  Bills: <ReceiptText className="h-4 w-4" />,
  Entertainment: <Ticket className="h-4 w-4" />,
  Health: <HeartPulse className="h-4 w-4" />,
  Misc: <Sparkles className="h-4 w-4" />,
};

const categoryColors = {
    Food: 'bg-red-500/10 text-red-400 border-red-500/20',
    Transport: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    Shopping: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    Bills: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
    Entertainment: 'bg-pink-500/10 text-pink-400 border-pink-500/20',
    Health: 'bg-green-500/10 text-green-400 border-green-500/20',
    Misc: 'bg-gray-500/10 text-gray-400 border-gray-500/20',
};

export default function TransactionsTable({
  transactions,
}: {
  transactions: AnnotatedTransaction[];
}) {
  return (
    <Card className="glass">
      <CardHeader>
        <CardTitle>All Transactions</CardTitle>
      </CardHeader>
      <CardContent>
        <TooltipProvider>
            <div className="overflow-x-auto">
                <Table>
                    <TableHeader>
                    <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead className="text-right">Amount</TableHead>
                    </TableRow>
                    </TableHeader>
                    <TableBody>
                    {transactions.map((t, index) => (
                        <TableRow
                        key={index}
                        className={cn(
                            t.isAnomalous && 'bg-destructive/10 hover:bg-destructive/20'
                        )}
                        >
                        <TableCell className="font-medium">{t.Date}</TableCell>
                        <TableCell>
                            <div className="flex items-center gap-2">
                                {t.Description}
                                {t.isAnomalous && (
                                    <Tooltip>
                                        <TooltipTrigger>
                                            <AlertTriangle className="h-4 w-4 text-destructive" />
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p className="font-bold">Anomaly Detected</p>
                                            <p>{t.anomalyReason}</p>
                                        </TooltipContent>
                                    </Tooltip>
                                )}
                            </div>
                        </TableCell>
                        <TableCell>
                            <Badge variant="outline" className={cn("gap-1.5", categoryColors[t.Category])}>
                                {categoryIcons[t.Category]}
                                {t.Category}
                            </Badge>
                        </TableCell>
                        <TableCell className="text-right font-semibold">
                            {formatCurrency(t.Amount)}
                        </TableCell>
                        </TableRow>
                    ))}
                    </TableBody>
                </Table>
            </div>
        </TooltipProvider>
      </CardContent>
    </Card>
  );
}
