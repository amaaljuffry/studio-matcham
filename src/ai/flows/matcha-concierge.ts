// This is an AI-powered function to provide recommendations for matcha cafes.
'use server';
/**
 * @fileOverview An AI agent that recommends matcha cafes based on user queries.
 *
 * - getMatchaCafeRecommendation - A function that returns cafe recommendations.
 * - MatchaCafeRecommendationInput - The input type for the getMatchaCafeRecommendation function.
 * - MatchaCafeRecommendationOutput - The return type for the getMatchaCafeRecommendation function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const MatchaCafeRecommendationInputSchema = z.object({
  query: z.string().describe('The user query for matcha cafe recommendations.'),
  cafeDetails: z.string().describe('Details of nearby matcha cafes including name, address, opening hours, menu links, and user ratings.'),
});
export type MatchaCafeRecommendationInput = z.infer<typeof MatchaCafeRecommendationInputSchema>;

const MatchaCafeRecommendationOutputSchema = z.object({
  recommendation: z.string().describe('The AI recommendation for matcha cafes based on the user query.'),
});
export type MatchaCafeRecommendationOutput = z.infer<typeof MatchaCafeRecommendationOutputSchema>;

export async function getMatchaCafeRecommendation(input: MatchaCafeRecommendationInput): Promise<MatchaCafeRecommendationOutput> {
  return matchaConciergeFlow(input);
}

const matchaConciergePrompt = ai.definePrompt({
  name: 'matchaConciergePrompt',
  input: {schema: MatchaCafeRecommendationInputSchema},
  output: {schema: MatchaCafeRecommendationOutputSchema},
  prompt: `You are an AI Matcha Concierge, providing recommendations for matcha cafes based on the user's query and the details of nearby cafes.

  User Query: {{{query}}}
  Cafe Details: {{{cafeDetails}}}

  Based on the query and cafe details, provide a recommendation for the user.
  If the user asks about hidden gems or unique menu items, use the cafe details to suggest specific cafes or items.
  Keep the recommendation concise and helpful.
  `,
});

const matchaConciergeFlow = ai.defineFlow(
  {
    name: 'matchaConciergeFlow',
    inputSchema: MatchaCafeRecommendationInputSchema,
    outputSchema: MatchaCafeRecommendationOutputSchema,
  },
  async input => {
    const {output} = await matchaConciergePrompt(input);
    return output!;
  }
);
