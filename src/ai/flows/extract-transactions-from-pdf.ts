'use server';
/**
 * @fileOverview Extracts transaction data from a PDF file.
 *
 * - extractTransactionsFromPdf - A function that handles the PDF parsing process.
 * - ExtractTransactionsFromPdfInput - The input type for the extractTransactionsFromPdf function.
 * - ExtractTransactionsFromPdfOutput - The return type for the extractTransactionsFromPdf function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const TransactionSchema = z.object({
  Date: z.string().describe('The date of the transaction in YYYY-MM-DD format.'),
  Description: z.string().describe('A description of the transaction.'),
  Amount: z.number().describe('The amount of the transaction.'),
});

const ExtractTransactionsFromPdfInputSchema = z.object({
  pdfDataUri: z
    .string()
    .describe(
      "A PDF file of a bank statement, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:application/pdf;base64,<encoded_data>'."
    ),
});
export type ExtractTransactionsFromPdfInput = z.infer<typeof ExtractTransactionsFromPdfInputSchema>;

const ExtractTransactionsFromPdfOutputSchema = z.object({
  transactions: z.array(TransactionSchema).describe('An array of transactions extracted from the PDF.'),
});
export type ExtractTransactionsFromPdfOutput = z.infer<typeof ExtractTransactionsFromPdfOutputSchema>;

export async function extractTransactionsFromPdf(input: ExtractTransactionsFromPdfInput): Promise<ExtractTransactionsFromPdfOutput> {
  return extractTransactionsFromPdfFlow(input);
}

const prompt = ai.definePrompt({
  name: 'extractTransactionsFromPdfPrompt',
  input: {schema: ExtractTransactionsFromPdfInputSchema},
  output: {schema: ExtractTransactionsFromPdfOutputSchema},
  prompt: `You are an expert at extracting structured data from documents.
Your task is to extract all transactions from the provided PDF bank statement.
For each transaction, you must extract the Date, Description, and Amount.
Ensure the date is in YYYY-MM-DD format.

PDF Document: {{media url=pdfDataUri}}`,
});

const extractTransactionsFromPdfFlow = ai.defineFlow(
  {
    name: 'extractTransactionsFromPdfFlow',
    inputSchema: ExtractTransactionsFromPdfInputSchema,
    outputSchema: ExtractTransactionsFromPdfOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);

    