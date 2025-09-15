'use client';

import type { DashboardData } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Download, FileDown } from 'lucide-react';
import CategoryPieChart from './category-pie-chart';
import SpendingBarChart from './spending-bar-chart';
import TransactionsTable from './transactions-table';
import SavingsAdvisor from './savings-advisor';
import { formatCurrency } from '@/lib/utils';
import { useTransition } from 'react';
import { useToast } from '@/hooks/use-toast';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import CategoryTreemap from './category-treemap';

type DashboardProps = {
  data: DashboardData;
  onReset: () => void;
};

export default function Dashboard({ data, onReset }: DashboardProps) {
  const [isExporting, startExportTransition] = useTransition();
  const { toast } = useToast();

  const handleExportPDF = () => {
    startExportTransition(async () => {
      const dashboardElement = document.getElementById('dashboard-content');
      if (!dashboardElement) {
        toast({
          variant: 'destructive',
          title: 'Export Failed',
          description: 'Could not find dashboard content to export.',
        });
        return;
      }
      
      toast({ title: 'Exporting PDF...', description: 'Please wait while we generate your report.' });

      try {
        const canvas = await html2canvas(dashboardElement, {
          scale: 2,
          useCORS: true,
          backgroundColor: null,
        });
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF({
          orientation: 'portrait',
          unit: 'px',
          format: [canvas.width, canvas.height],
        });
        pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
        pdf.save(`spendsense-report-${new Date().toISOString().split('T')[0]}.pdf`);
        toast({ title: 'Export Successful', description: 'Your PDF report has been downloaded.' });
      } catch (error) {
        console.error('PDF export failed:', error);
        toast({
          variant: 'destructive',
          title: 'Export Failed',
          description: 'An error occurred while generating the PDF.',
        });
      }
    });
  };

  const handleExportCSV = () => {
     startExportTransition(() => {
        const headers = ['Date', 'Description', 'Amount', 'Category', 'IsAnomalous', 'AnomalyReason'];
        const csvRows = [
            headers.join(','),
            ...data.transactions.map(t => [
                t.Date,
                `"${t.Description.replace(/"/g, '""')}"`,
                t.Amount,
                t.Category,
                t.isAnomalous,
                t.anomalyReason ? `"${t.anomalyReason.replace(/"/g, '""')}"` : ''
            ].join(','))
        ];
        
        const csvContent = "data:text/csv;charset=utf-8," + csvRows.join('\n');
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `spendsense-data-${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast({ title: 'Export Successful', description: 'Your CSV data has been downloaded.' });
     });
  };

  return (
    <div className="w-full max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <Button variant="ghost" onClick={onReset} className="mb-2 text-gray-300 hover:text-white">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Upload
          </Button>
          <h1 className="text-3xl font-bold font-headline text-white">Your Financial Dashboard</h1>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleExportPDF} disabled={isExporting}>
            <Download className="mr-2 h-4 w-4" /> Export PDF
          </Button>
          <Button variant="outline" onClick={handleExportCSV} disabled={isExporting}>
            <FileDown className="mr-2 h-4 w-4" /> Export CSV
          </Button>
        </div>
      </div>

      <div id="dashboard-content" className="bg-background">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="glass lg:col-span-2">
                <CardHeader>
                    <CardTitle>Spending by Category</CardTitle>
                </CardHeader>
                <CardContent>
                    <CategoryTreemap data={data.stats.categoryTotals} />
                </CardContent>
            </Card>
            <div className="flex flex-col gap-6">
                <Card className="glass">
                    <CardHeader>
                        <CardTitle>Total Monthly Spend</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-4xl font-bold text-primary">{formatCurrency(data.stats.totalSpent)}</p>
                    </CardContent>
                </Card>
                 <Card className="glass">
                    <CardHeader>
                        <CardTitle>Category Breakdown</CardTitle>
                    </CardHeader>
                    <CardContent className="flex justify-center items-center">
                        <CategoryPieChart data={data.stats.categoryTotals} />
                    </CardContent>
                </Card>
            </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 mt-6">
          <div className="lg:col-span-3 flex flex-col gap-6">
            <Card className="glass">
              <CardHeader>
                <CardTitle>Daily Spending Trend</CardTitle>
              </CardHeader>
              <CardContent>
                <SpendingBarChart data={data.stats.dailySpending} />
              </CardContent>
            </Card>
          </div>
          <div className="lg:col-span-2 flex flex-col gap-6">
            <SavingsAdvisor tips={data.savingsTips} />
          </div>
        </div>

        <div className="mt-6">
          <TransactionsTable transactions={data.transactions} />
        </div>
      </div>
    </div>
  );
}
