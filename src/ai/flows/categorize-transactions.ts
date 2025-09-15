// categorize-transactions.ts
'use server';
/**
 * @fileOverview Transaction categorization flow using AI-assisted keyword matching.
 *
 * This file defines a Genkit flow for automatically categorizing transactions
 * into predefined categories based on their description. It uses a combination
 * of rule-based keyword matching and AI to improve accuracy.
 *
 * @exports categorizeTransactions - The main function to categorize transactions.
 * @exports CategorizeTransactionsInput - The input type for the categorizeTransactions function.
 * @exports CategorizeTransactionsOutput - The output type for the categorizeTransactions function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

// Define the schema for a single transaction
const TransactionSchema = z.object({
  Date: z.string().describe('The date of the transaction.'),
  Description: z.string().describe('A description of the transaction.'),
  Amount: z.number().describe('The amount of the transaction.'),
});

// Define the input schema for the categorizeTransactions function
const CategorizeTransactionsInputSchema = z.object({
  transactions: z.array(TransactionSchema).describe('An array of transactions to categorize.'),
});
export type CategorizeTransactionsInput = z.infer<typeof CategorizeTransactionsInputSchema>;

// Define the output schema for the categorizeTransactions function
const CategorizeTransactionsOutputSchema = z.object({
  categorizedTransactions: z.array(
    TransactionSchema.extend({
      Category: z
        .string()
        .describe('The AI-categorized category of the transaction.'),
    })
  ),
});
export type CategorizeTransactionsOutput = z.infer<typeof CategorizeTransactionsOutputSchema>;

// Exported function to categorize transactions
export async function categorizeTransactions(input: CategorizeTransactionsInput): Promise<CategorizeTransactionsOutput> {
  return categorizeTransactionsFlow(input);
}

// Define the prompt for categorizing transactions
const categorizeTransactionsPrompt = ai.definePrompt({
  name: 'categorizeTransactionsPrompt',
  input: {
    schema: CategorizeTransactionsInputSchema,
  },
  output: {
    schema: CategorizeTransactionsOutputSchema,
  },
  prompt: `You are a personal finance expert tasked with categorizing bank transactions.

  Given the following list of transactions, categorize each transaction into one of the following categories:
  Food, Transport, Shopping, Bills, Entertainment, Health, Misc

  Return the original list of transactions, with an added "Category" field.

  Transactions:
  {{#each transactions}}
  Date: {{{Date}}}, Description: {{{Description}}}, Amount: {{{Amount}}}
  {{/each}}
  `,
});

// Define the Genkit flow for categorizing transactions
const categorizeTransactionsFlow = ai.defineFlow(
  {
    name: 'categorizeTransactionsFlow',
    inputSchema: CategorizeTransactionsInputSchema,
    outputSchema: CategorizeTransactionsOutputSchema,
  },
  async input => {
    const { output } = await categorizeTransactionsPrompt(input);
    return output!;
  }
);
