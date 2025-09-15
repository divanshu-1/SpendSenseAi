'use server';

/**
 * @fileOverview This file defines a Genkit flow for generating personalized savings tips.
 *
 * The flow analyzes spending patterns and provides actionable advice to improve the user's financial situation.
 * - generateSavingsTips - A function that generates personalized savings tips.
 * - GenerateSavingsTipsInput - The input type for the generateSavingsTips function.
 * - GenerateSavingsTipsOutput - The return type for the generateSavingsTips function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateSavingsTipsInputSchema = z.object({
  spendingData: z.string().describe('A CSV string of the user\'s spending data, including Date, Description, and Amount.'),
  totalMonthlySpend: z.number().describe('The total monthly spending amount.'),
});
export type GenerateSavingsTipsInput = z.infer<typeof GenerateSavingsTipsInputSchema>;

const GenerateSavingsTipsOutputSchema = z.object({
  savingsTips: z.array(
    z.object({
      tip: z.string().describe('A personalized savings tip.'),
      estimatedSavings: z.number().describe('The estimated monthly savings from following this tip.'),
    })
  ).describe('An array of personalized savings tips with estimated savings.'),
});
export type GenerateSavingsTipsOutput = z.infer<typeof GenerateSavingsTipsOutputSchema>;

export async function generateSavingsTips(input: GenerateSavingsTipsInput): Promise<GenerateSavingsTipsOutput> {
  return generateSavingsTipsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateSavingsTipsPrompt',
  input: {schema: GenerateSavingsTipsInputSchema},
  output: {schema: GenerateSavingsTipsOutputSchema},
  prompt: `You are a personal finance advisor. Analyze the user's spending data and provide three personalized savings tips with estimated monthly savings for each tip.

Spending Data:
{{spendingData}}

Total Monthly Spend: {{totalMonthlySpend}}

Format the output as a JSON object with a 'savingsTips' array. Each object in the array must have a 'tip' (string) and an 'estimatedSavings' (number) field.

Example:
{
  "savingsTips": [
    {
      "tip": "Cut food deliveries by 50%",
      "estimatedSavings": 2000
    },
    {
      "tip": "Reduce transportation costs by using public transport twice a week",
      "estimatedSavings": 1000
    },
    {
      "tip": "Limit entertainment spending by 25%",
      "estimatedSavings": 500
    }
  ]
}`,
});

const generateSavingsTipsFlow = ai.defineFlow(
  {
    name: 'generateSavingsTipsFlow',
    inputSchema: GenerateSavingsTipsInputSchema,
    outputSchema: GenerateSavingsTipsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
