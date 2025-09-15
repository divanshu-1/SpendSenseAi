'use client';

import { useState, useTransition, useCallback, ChangeEvent } from 'react';
import {
  categorizeTransactionsAction,
  detectAnomaliesAction,
  generateSavingsTipsAction,
  extractTransactionsFromPdfAction,
} from '@/app/actions';
import type {
  Transaction,
  DashboardData,
  CategorizedTransaction,
  AnnotatedTransaction,
  Category,
} from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { UploadCloud, File as FileIcon, X, Loader2, Wand2, TestTube2, User } from 'lucide-react';
import Dashboard from '@/components/app/dashboard';
import { Logo } from '@/components/app/logo';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import LoginDialog from '@/components/app/login-dialog';

type View = 'upload' | 'loading' | 'dashboard' | 'error';

export default function Home() {
  const [view, setView] = useState<View>('upload');
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [file, setFile] = useState<File | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const { toast } = useToast();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoginDialogOpen, setIsLoginDialogOpen] = useState(false);

  const resetState = () => {
    setView('upload');
    setDashboardData(null);
    setError(null);
    setFile(null);
    setIsDragOver(false);
    // Reset any pending transitions
    if (isPending) {
      // Force reset of transition state
      window.location.reload();
    }
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFile(e.target.files[0]);
    }
  };

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
    }
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  }, []);

  const processData = async (file: File) => {
    startTransition(async () => {
      try {
        setView('loading');
        setError(null);

        // Check if API key is configured
        if (!process.env.NEXT_PUBLIC_GOOGLE_GENAI_API_KEY && typeof window !== 'undefined') {
          console.warn('Google AI API key not found in environment variables');
        }
        
        let transactions: Transaction[];
        let rawData: string;

        if (file.type === 'text/csv') {
            rawData = await file.text();
            // 1. Parse CSV
            const rows = rawData.trim().split('\n');
            const headers = rows[0].split(',').map(h => h.trim());
            transactions = rows.slice(1).map(row => {
              const values = row.split(',');
              return headers.reduce((obj, header, index) => {
                const value = values[index].trim();
                if (header === 'Amount') {
                  (obj as any)[header] = parseFloat(value);
                } else {
                  (obj as any)[header] = value;
                }
                return obj;
              }, {} as Transaction);
            });
        } else if (file.type === 'application/pdf') {
            const reader = new FileReader();
            const pdfData = await new Promise<string>((resolve, reject) => {
                reader.onload = (event) => {
                    resolve(event.target?.result as string);
                };
                reader.onerror = reject;
                reader.readAsDataURL(file);
            });
            
            const extractedResult = await extractTransactionsFromPdfAction({ pdfDataUri: pdfData });
            transactions = extractedResult.transactions;
            
            // For saving tips, we need a string representation.
            // Let's create a CSV-like string from the extracted transactions.
            const headers = "Date,Description,Amount";
            const rows = transactions.map(t => `${t.Date},${t.Description},${t.Amount}`);
            rawData = `${headers}\n${rows.join('\n')}`;

        } else {
            throw new Error(`Unsupported file type: ${file.type}. Please upload a CSV or PDF.`);
        }
        
        if (transactions.length === 0) {
            throw new Error("No transactions found in the file.");
        }

        // 2. AI Categorization
        const categorizedResult = await categorizeTransactionsAction({
          transactions,
        });
        const categorizedTransactions: CategorizedTransaction[] =
          categorizedResult.categorizedTransactions.map(t => ({...t, Category: t.Category as Category}));

        // 3. Pre-process for Anomaly Detection
        const totalMonthlySpend = categorizedTransactions.reduce(
          (sum, t) => sum + t.Amount,
          0
        );
        const categorySpends: { [key in Category]?: number[] } = {};
        categorizedTransactions.forEach(t => {
          if (!categorySpends[t.Category]) {
            categorySpends[t.Category] = [];
          }
          categorySpends[t.Category]!.push(t.Amount);
        });
        const medianCategorySpend: { [key in Category]?: number } = {};
        for (const cat in categorySpends) {
            const category = cat as Category;
            const spends = categorySpends[category]!.sort((a,b) => a - b);
            const mid = Math.floor(spends.length / 2);
            medianCategorySpend[category] = spends.length % 2 !== 0 ? spends[mid] : (spends[mid - 1] + spends[mid]) / 2;
        }

        const anomalyDetectionInput = categorizedTransactions.map(t => ({
          date: t.Date,
          description: t.Description,
          amount: t.Amount,
          category: t.Category,
          monthlySpend: totalMonthlySpend,
          medianCategorySpend: medianCategorySpend[t.Category] || 0,
        }));
        
        // 4. AI Anomaly Detection
        const anomaliesResult = await detectAnomaliesAction({
          transactions: anomalyDetectionInput,
        });
        
        // 5. AI Savings Advisor
        const savingsTipsInput = {
            spendingData: rawData,
            totalMonthlySpend
        }
        const savingsTipsResult = await generateSavingsTipsAction(savingsTipsInput);

        // 6. Combine data
        const annotatedTransactions: AnnotatedTransaction[] =
          categorizedTransactions.map((t, index) => {
            const anomaly = anomaliesResult.anomalies.find(
              a => a.transactionIndex === index
            );
            return {
              ...t,
              isAnomalous: anomaly?.isAnomalous || false,
              anomalyReason: anomaly?.reason,
            };
          });

        // 7. Calculate stats for charts
        const categoryTotals = annotatedTransactions.reduce((acc, t) => {
            acc[t.Category] = (acc[t.Category] || 0) + t.Amount;
            return acc;
        }, {} as { [key in Category]?: number });

        const dailySpending = annotatedTransactions.reduce((acc, t) => {
            const existing = acc.find(d => d.date === t.Date);
            if (existing) {
                existing.amount += t.Amount;
            } else {
                acc.push({ date: t.Date, amount: t.Amount });
            }
            return acc;
        }, [] as { date: string; amount: number }[]).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

        setDashboardData({
          transactions: annotatedTransactions,
          savingsTips: savingsTipsResult.savingsTips,
          stats: {
            totalSpent: totalMonthlySpend,
            categoryTotals,
            dailySpending
          },
        });
        setView('dashboard');
      } catch (e: any) {
        console.error('Processing error:', e);
        const errorMessage = e.message || 'An unexpected error occurred during processing.';
        setError(errorMessage);
        setView('error');

        // Reset file state on error to prevent getting stuck
        setFile(null);

        toast({
          variant: 'destructive',
          title: 'Processing Failed',
          description: errorMessage.includes('API') ? 'Please check your API key configuration and try again.' : 'Please check the file and try again.',
        });
      }
    });
  };

  const handleProcessFile = () => {
    console.log('handleProcessFile called, file:', file);
    if (file) {
      console.log('Processing file:', file.name, file.type);
      processData(file);
    } else {
      console.log('No file selected');
      toast({
        variant: 'destructive',
        title: 'No File Selected',
        description: 'Please select a CSV or PDF file to analyze.',
      });
    }
  };
  
  const handleUseSampleData = async () => {
    try {
        const response = await fetch('/sample-transactions.csv');
        const data = await response.text();
        const sampleFile = new File([data], "sample-transactions.csv", { type: "text/csv" });
        setFile(sampleFile);
        toast({
            title: "Sample data loaded!",
            description: "Click 'Analyze Transactions' to process the data.",
        });
    } catch(e: any) {
        console.error("Failed to load sample data", e);
        toast({
            variant: "destructive",
            title: "Could not load sample data",
            description: "Please try again later.",
        });
    }
  }

  const handleLoginSuccess = () => {
    setIsLoggedIn(true);
    setIsLoginDialogOpen(false);
  }

  const renderUploadView = () => (
      <div className="w-full max-w-4xl mx-auto px-4 py-8 md:py-16">
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={cn(
            "relative flex flex-col items-center justify-center w-full p-8 md:p-12 border-2 border-dashed rounded-xl transition-colors duration-300",
            isDragOver ? "border-primary bg-primary/10" : "border-border hover:border-primary/50"
          )}
        >
          <div className="absolute inset-0 bg-grid-slate-100/[0.05] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]"></div>
          <div className="relative z-10 flex flex-col items-center text-center">
              <UploadCloud className="w-16 h-16 text-primary/80 mb-4" />
              <h3 className="text-2xl font-semibold font-headline">Drag & drop your CSV or PDF file here</h3>
              <p className="text-muted-foreground mt-2">or click to browse</p>
              <input
                type="file"
                accept=".csv,.pdf"
                onChange={handleFileChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
          </div>
        </div>

        {file && (
          <div className="mt-6 p-4 bg-muted/50 rounded-lg flex items-center justify-between">
            <div className="flex items-center gap-3">
              <FileIcon className="h-5 w-5 text-muted-foreground" />
              <div className="flex flex-col">
                <span className="font-medium text-foreground">{file.name}</span>
                <span className="text-sm text-muted-foreground">
                  {file.name === 'sample-transactions.csv' ? 'Sample data ready for analysis' : 'File ready for analysis'}
                </span>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={() => setFile(null)}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
            <Button
              size="lg"
              onClick={handleProcessFile}
              disabled={isPending}
              className="bg-primary hover:bg-primary/90 disabled:opacity-50"
            >
                {isPending ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Processing...
                  </>
                ) : (
                  <>
                    <Wand2 className="mr-2 h-5 w-5" />
                    Analyze Transactions
                  </>
                )}
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={handleUseSampleData}
              disabled={isPending}
              className="border-primary text-primary hover:bg-primary/10"
            >
                <TestTube2 className="mr-2 h-5 w-5" />
                Try with Sample Data
            </Button>
        </div>
      </div>
    );

  const renderContent = () => {
    if (!isLoggedIn) {
      return (
        <div className="flex items-center justify-center min-h-[80vh]">
          <div className="text-center max-w-4xl mx-auto px-4">
            <h1 className="font-headline text-4xl md:text-6xl lg:text-7xl font-bold tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-primary via-blue-400 to-accent mb-6">
                SpendSense AI
            </h1>
            <p className="mt-6 text-lg md:text-xl lg:text-2xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
                Smarter Spending, Better Saving. Turn your transaction data into actionable financial insights.
            </p>
            <div className="mt-10">
              <Button size="lg" className="px-8 py-4 text-lg" onClick={() => setIsLoginDialogOpen(true)}>
                Get Started
              </Button>
            </div>
          </div>
        </div>
      );
    }
    switch (view) {
      case 'loading':
        return (
          <div className="flex flex-col items-center justify-center text-center p-8">
            <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
            <h2 className="text-2xl font-headline font-semibold text-foreground">
              Analyzing Your Spending...
            </h2>
            <p className="text-muted-foreground mt-2">
              Our AI is working its magic. This might take a moment.
            </p>
          </div>
        );
      case 'dashboard':
        return dashboardData ? (
          <Dashboard data={dashboardData} onReset={resetState} />
        ) : null;
      case 'error':
        return (
          <div className="flex flex-col items-center justify-center text-center p-8">
            <Alert variant="destructive" className="max-w-lg">
              <AlertTitle>Analysis Failed</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
            <Button onClick={resetState} className="mt-6">
              Try Again
            </Button>
          </div>
        );
      case 'upload':
      default:
        return renderUploadView();
    }
  };

  return (
    <div className="min-h-screen w-full bg-background dark:bg-grid-white/[0.05] bg-grid-black/[0.02]">
      <div className="absolute pointer-events-none inset-0 flex items-center justify-center bg-background [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]"></div>
      <header className="p-4 flex justify-between items-center">
        <div className="flex items-center gap-2">
            <Logo className="h-8 w-8 text-primary" />
            <span className="font-headline font-semibold text-xl text-white">SpendSense AI</span>
        </div>
        <Button variant="ghost" size="icon" onClick={() => setIsLoginDialogOpen(true)}>
            <User className="h-5 w-5" />
            <span className="sr-only">Login</span>
        </Button>
      </header>
      <main className="flex-grow">
        {renderContent()}
      </main>
      <LoginDialog
        isOpen={isLoginDialogOpen}
        onClose={() => setIsLoginDialogOpen(false)}
        onLoginSuccess={handleLoginSuccess}
      />
    </div>
  );
}
