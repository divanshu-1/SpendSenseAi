'use server';

import {
  categorizeTransactions,
  CategorizeTransactionsInput,
  CategorizeTransactionsOutput,
} from '@/ai/flows/categorize-transactions';
import {
  detectAnomalousTransactions,
  DetectAnomalousTransactionsInput,
  DetectAnomalousTransactionsOutput,
} from '@/ai/flows/detect-anomalies';
import {
  generateSavingsTips,
  GenerateSavingsTipsInput,
  GenerateSavingsTipsOutput,
} from '@/ai/flows/generate-savings-tips';
import {
  extractTransactionsFromPdf,
  ExtractTransactionsFromPdfInput,
  ExtractTransactionsFromPdfOutput,
} from '@/ai/flows/extract-transactions-from-pdf';


export async function categorizeTransactionsAction(
  input: CategorizeTransactionsInput
): Promise<CategorizeTransactionsOutput> {
  return await categorizeTransactions(input);
}

export async function detectAnomaliesAction(
  input: DetectAnomalousTransactionsInput
): Promise<DetectAnomalousTransactionsOutput> {
  return await detectAnomalousTransactions(input);
}

export async function generateSavingsTipsAction(
  input: GenerateSavingsTipsInput
): Promise<GenerateSavingsTipsOutput> {
  return await generateSavingsTips(input);
}

export async function extractTransactionsFromPdfAction(
  input: ExtractTransactionsFromPdfInput
): Promise<ExtractTransactionsFromPdfOutput> {
  return await extractTransactionsFromPdf(input);
}

    