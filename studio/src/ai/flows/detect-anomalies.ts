'use server';

/**
 * @fileOverview Identifies anomalous transactions and provides AI-driven reasoning.
 *
 * - detectAnomalousTransactions - A function that detects unusual transactions.
 * - DetectAnomalousTransactionsInput - The input type for the detectAnomalousTransactions function.
 * - DetectAnomalousTransactionsOutput - The return type for the detectAnomalousTransactions function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const DetectAnomalousTransactionsInputSchema = z.object({
  transactions: z.array(
    z.object({
      date: z.string().describe('The date of the transaction.'),
      description: z.string().describe('The description of the transaction.'),
      amount: z.number().describe('The amount of the transaction.'),
      category: z.string().describe('The category of the transaction.'),
      monthlySpend: z.number().describe('The total monthly spend.'),
      medianCategorySpend: z.number().describe('The median spend for the transaction category.'),
    })
  ).describe('An array of transactions to analyze.'),
});

export type DetectAnomalousTransactionsInput = z.infer<
  typeof DetectAnomalousTransactionsInputSchema
>;

const AnomalySchema = z.object({
  transactionIndex: z.number().describe('The index of the transaction in the input array.'),
  isAnomalous: z.boolean().describe('Whether the transaction is anomalous.'),
  reason: z.string().describe('The AI-driven reasoning for why the transaction is anomalous.'),
});

const DetectAnomalousTransactionsOutputSchema = z.object({
  anomalies: z.array(AnomalySchema).describe('An array of detected anomalies.'),
});

export type DetectAnomalousTransactionsOutput = z.infer<
  typeof DetectAnomalousTransactionsOutputSchema
>;

export async function detectAnomalousTransactions(
  input: DetectAnomalousTransactionsInput
): Promise<DetectAnomalousTransactionsOutput> {
  return detectAnomalousTransactionsFlow(input);
}

const detectAnomalousTransactionsPrompt = ai.definePrompt({
  name: 'detectAnomalousTransactionsPrompt',
  input: {schema: DetectAnomalousTransactionsInputSchema},
  output: {schema: DetectAnomalousTransactionsOutputSchema},
  prompt: `You are an expert financial analyst tasked with identifying anomalous transactions in a user's spending data.

  Analyze the provided transactions and flag any transactions that meet the following criteria:

  1.  The transaction amount is greater than 3 times the median spend for that category.
  2.  The transaction amount is greater than 20% of the total monthly spend.
  3.  The transaction is unique in the dataset (i.e., no similar transactions exist).

  For each flagged transaction, provide a clear and concise reason explaining why it is considered anomalous.

  Transactions:
  {{#each transactions}}
  Index: {{@index}}
  Date: {{this.date}}
  Description: {{this.description}}
  Amount: {{this.amount}}
  Category: {{this.category}}
  Monthly Spend: {{this.monthlySpend}}
  Median Category Spend: {{this.medianCategorySpend}}
  {{/each}}

  Output the results in the following JSON format:
  {
    "anomalies": [
      {
        "transactionIndex": number, // The index of the transaction in the input array
        "isAnomalous": boolean, // Whether the transaction is anomalous
        "reason": string // The AI-driven reasoning for why the transaction is anomalous
      }
    ]
  }`,
});

const detectAnomalousTransactionsFlow = ai.defineFlow(
  {
    name: 'detectAnomalousTransactionsFlow',
    inputSchema: DetectAnomalousTransactionsInputSchema,
    outputSchema: DetectAnomalousTransactionsOutputSchema,
  },
  async input => {
    const {output} = await detectAnomalousTransactionsPrompt(input);
    return output!;
  }
);
