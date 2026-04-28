import Similarity from 'compute-cosine-similarity';
import idf from './idf.json' with { type: 'json' };
import importantKeywordsArray from './important-keywords.json' with { type: 'json' };

const TOKEN_REGEX = /\b[a-zA-Z][a-zA-Z0-9+#.\-]{2,}\b/g;

function generateFeatures(tokens: string[]): string[] {
  const features: string[] = [];

  for (let i = 0; i < tokens.length; i++) {
    const a = tokens[i];
    const b = tokens[i + 1];

    // unigram
    features.push(a);

    // bigram
    if (b) {
      features.push(`${a} ${b}`);
    }
  }

  return features;
}

// Convert array to Set for fast lookups
const importantKeywords = new Set(importantKeywordsArray);

export function hardcodedKeywords(text: string): Map<string, number> {
  const counts = new Map<string, number>();

  // tokenize (aligned with your Python token_pattern)
  const tokens = text.toLowerCase().match(TOKEN_REGEX) ?? [];

  for (const word of tokens) {
    counts.set(word, (counts.get(word) ?? 0) + 1);
  }

  // scale count for important keywords
  for (const [word, count] of counts) {
    if (importantKeywords.has(word)) counts.set(word, count * 6);
  }

  return counts;
}

export function extractKeywordsWithIdf(text: string): Map<string, number> {
  const counts = new Map<string, number>();

  // tokenize (aligned with your Python token_pattern)
  const tokens = generateFeatures(text.toLowerCase().match(TOKEN_REGEX) ?? []);

  for (const word of tokens) {
    counts.set(word, (counts.get(word) ?? 0) + 1);
  }

  // convert TF → TF-IDF
  const tfidf = new Map<string, number>();

  for (const [word, count] of counts) {
    const tf = 1 + Math.log(count);
    const weight = tf * (idf[word as keyof typeof idf] ?? 0);

    tfidf.set(word, weight);
  }

  return tfidf;
}

export function extractKeywords(
  text: string,
  strategy: 'idf-tf' | 'hardcoded' = 'idf-tf'
): Map<string, number> {
  if (strategy === 'hardcoded') {
    return hardcodedKeywords(text);
  }
  return extractKeywordsWithIdf(text);
}

export function getTopNKeywords({
  keywordMap: counts,
  numKeywords,
}: {
  keywordMap: Map<string, number>;
  numKeywords: number;
}): string[] {
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, numKeywords)
    .map(([k]) => k);
}

export function calculateCosineSimilarity(
  jobDescription: string,
  resumeText: string,
  strategy: 'idf-tf' | 'hardcoded' = 'idf-tf'
): number {
  // Extract keywords
  const jobKeywords = extractKeywords(jobDescription, strategy);
  const resumeKeywords = extractKeywords(resumeText, strategy);

  // Combine all keywords
  const keywords = new Set([...jobKeywords.keys(), ...resumeKeywords.keys()]);

  // Vector to be used to calculate cosine similarity score
  const jobArray: number[] = [];
  const resumeArray: number[] = [];

  // Populate array with number of occurences of keyword in resume and job description
  // Note: Number of occurences does not actually matter when calculating cosineSimilarity.
  for (const word of keywords) {
    jobArray.push(jobKeywords.get(word) ?? 0);
    resumeArray.push(resumeKeywords.get(word) ?? 0);
  }

  // If an array is empty due to STOP words, return 0 instead.
  if (
    jobArray.every((occurance) => occurance === 0) ||
    resumeArray.every((occurance) => occurance === 0)
  ) {
    return 0;
  }

  // Calculate similarity score
  const similarity = Similarity(jobArray, resumeArray) || 0;
  return Math.round(similarity * 100);
}
