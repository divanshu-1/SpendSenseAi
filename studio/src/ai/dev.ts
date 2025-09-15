import { config } from 'dotenv';
config();

import '@/ai/flows/generate-savings-tips.ts';
import '@/ai/flows/categorize-transactions.ts';
import '@/ai/flows/detect-anomalies.ts';
import '@/ai/flows/extract-transactions-from-pdf.ts';

    