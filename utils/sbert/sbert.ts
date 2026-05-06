import { pipeline, type PretrainedOptions } from '@xenova/transformers';
import DOMPurify from 'dompurify';

// SBERT model for semantic similarity calculation
// Using a pre-trained sentence-transformers model for semantic text matching
export const SBERT_MODEL_ID = 'Xenova/all-MiniLM-L6-v2';

/**
 * Clean text by removing HTML tags, normalizing whitespace, and handling special characters
 *
 * @param text - Raw text that may contain HTML
 * @returns Cleaned text ready for SBERT processing
 */
export function cleanText(text: string): string {
  if (!text) return '';

  // Use DOMPurify to safely parse and sanitize HTML
  const parsed = DOMPurify.sanitize(text);

  // Remove remaining HTML tags
  const withoutHtml = parsed.replace(/<[^>]*>/g, '');

  // Remove HTML entities and convert to plain text
  const withoutEntities = withoutHtml
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#x([0-9a-fA-F]+);/g, (match, hex) =>
      String.fromCharCode(parseInt(hex, 16))
    )
    .replace(/&#([0-9]+);/g, (match, dec) =>
      String.fromCharCode(parseInt(dec, 10))
    );

  // Normalize whitespace (multiple spaces/newlines to single space)
  const normalized = withoutEntities.replace(/\s+/g, ' ').trim();

  // Remove excessive punctuation but keep basic punctuation
  const cleaned = normalized.replace(/[^\w\s.,!?;:'"-]+/g, (match) => {
    // Keep common punctuation, remove excessive special chars
    if (['.', ',', '!', '?', ';', ':', "'", '"'].includes(match)) {
      return match;
    }
    return '';
  });

  return cleaned;
}

function truncate(txt: string) {
  const maxLen = 512;
  return txt.length > maxLen ? txt.slice(0, maxLen) : txt;
}
/**
 * Global cached pipeline instance for SBERT
 * Caching ensures consistent model loading and better performance
 */
let cachedExtractor: any = null;

/**
 * Get or create the cached SBERT pipeline instance
 */
async function getExtractor(): Promise<any> {
  if (!cachedExtractor) {
    cachedExtractor = await pipeline('feature-extraction', SBERT_MODEL_ID, {
      quantized: true, // Use full precision model for better accuracy
    } as PretrainedOptions);
  }
  return cachedExtractor;
}
const resumeEmbCache = new Map();

/**
 * Calculate semantic similarity between two texts using SBERT
 *
 * @param jobDesc - First text (job description)
 * @param resume - Second text (resume)
 * @returns Similarity score between 0 and 1
 */
export async function calculateSbertSimilarity(
  jobDesc: string,
  resume: string
): Promise<number> {
  try {
    // Clean input text to remove HTML and normalize
    const cleanJobDesc = truncate(cleanText(jobDesc));
    const cleanResume = cleanText(resume);

    // Get cached extractor instance
    const extractor = await getExtractor();

    // Get embeddings for both texts
    const jobDescEmb = await extractor(cleanJobDesc, {
      pooling: 'mean',
      normalize: true,
    });

    const resumeEmb = resumeEmbCache.has(cleanResume)
      ? resumeEmbCache.get(cleanResume)
      : await extractor(cleanResume, {
        pooling: 'mean',
        normalize: true,
      });
    resumeEmbCache.set(cleanResume, resumeEmb);

    // Calculate cosine similarity between embeddings
    // Both embeddings are normalized, so we can use dot product
    const similarity = (jobDescEmb.data as number[]).reduce((acc, val, idx) => {
      return acc + val * (resumeEmb.data as number[])[idx];
    }, 0);

    // Return similarity score (already normalized)
    const score = Math.round(Math.max(0, Math.min(1, similarity)) * 100);
    console.log('sbert', { score });

    return score;
  } catch (error) {
    console.error('Error calculating SBERT similarity:', error);
    // Return a default low score on error
    return 0;
  }
}
