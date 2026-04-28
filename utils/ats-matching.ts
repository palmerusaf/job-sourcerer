import Similarity from 'compute-cosine-similarity';
import idf from './idf.json' with { type: 'json' };
import importantKeywordsArray from './important-keywords.json' with { type: 'json' };

const TOKEN_REGEX = /\b[a-zA-Z][a-zA-Z0-9+#.\-]{2,}\b/g;

// Convert array to Set for fast lookups
const importantKeywords = new Set(importantKeywordsArray);

export function extractKeywords(
  text: string,
  strategy: 'idf-tf' | 'hardcoded' = 'idf-tf'
): Map<string, number> {
  if (strategy === 'hardcoded') {
    return _withHardcoded(text);
  }
  return _withIdf(text);
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
  strategy: 'idf-tf' | 'hardcoded' = 'idf-tf',
  useSbert = false
): number {
  const keywordScore = _getKeywordScore(jobDescription, resumeText, strategy);
  if (useSbert) {
    const sbertScore = _calculateSbertSimilarity(jobDescription, resumeText);
    // Combine keyword score and SBERT score with reasonable weighting
    // Using 50/50 blend to balance semantic understanding with keyword matching
    return Math.round(keywordScore * 0.5 + sbertScore * 0.5);
  }
  return keywordScore;
}

function _calculateSbertSimilarity(
  jobDescription: string,
  resumeText: string
): number {
  // Placeholder for SBERT implementation
  // In production, this would use a model like sentence-transformers
  // For now, return a normalized score between 0 and 1
  // This could be replaced with actual SBERT model inference
  return 0.0;
}

function _getKeywordScore(
  jobDescription: string,
  resumeText: string,
  strategy: 'idf-tf' | 'hardcoded' = 'idf-tf'
) {
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

  const zeroDiv =
    jobArray.every((e) => e === 0) || resumeArray.every((e) => e === 0);

  // Calculate similarity score
  const similarity = zeroDiv ? 0 : Similarity(jobArray, resumeArray) || 0;
  return Math.round(similarity * 100);
}

function _withHardcoded(text: string): Map<string, number> {
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

function _withIdf(text: string): Map<string, number> {
  const counts = new Map<string, number>();

  // tokenize (aligned with your Python token_pattern)
  const tokens = _genFeat(text.toLowerCase().match(TOKEN_REGEX) ?? []);

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

  function _genFeat(tokens: string[]): string[] {
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
}
