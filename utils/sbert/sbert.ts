import {
  pipeline,
  type PretrainedOptions,
  type Tensor,
} from '@xenova/transformers';
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
    .replace(/&#x([0-9a-fA-F]+);/g, (match, hex) => String.fromCharCode(parseInt(hex, 16)))
    .replace(/&#([0-9]+);/g, (match, dec) => String.fromCharCode(parseInt(dec, 10)));

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

/**
 * Calculate semantic similarity between two texts using SBERT
 *
 * @param text1 - First text (job description)
 * @param text2 - Second text (resume)
 * @returns Similarity score between 0 and 1
 */
export async function calculateSbertSimilarity(
  text1: string,
  text2: string
): Promise<number> {
  try {
    // Clean input text to remove HTML and normalize
    const cleanedText1 = cleanText(text1);
    const cleanedText2 = cleanText(text2);

    // Create feature extraction pipeline for SBERT
    // Use from_pretrained with URL to load model from Hugging Face Hub
    const extractor = await pipeline('feature-extraction', SBERT_MODEL_ID, {
      quantized: true, // Use quantized model for faster inference
    } as PretrainedOptions);

    // Get embeddings for both texts
    const embeddings1 = await extractor(cleanedText1, {
      pooling: 'mean',
      normalize: true,
    });

    const embeddings2 = await extractor(cleanedText2, {
      pooling: 'mean',
      normalize: true,
    });

    // Calculate cosine similarity between embeddings
    // Both embeddings are normalized, so we can use dot product
    const similarity = (embeddings1.data as number[]).reduce(
      (acc, val, idx) => {
        return acc + val * (embeddings2.data as number[])[idx];
      },
      0
    );

    // Return similarity score (already normalized)
    return Math.max(0, Math.min(1, similarity));
  } catch (error) {
    console.error('Error calculating SBERT similarity:', error);
    // Return a default low score on error
    return 0;
  }
}

/**
 * Calculate semantic similarity using a cached pipeline instance
 *
 * @param text1 - First text (job description)
 * @param text2 - Second text (resume)
 * @param extractor - Optional pre-loaded pipeline instance
 * @returns Similarity score between 0 and 1
 */
export async function calculateSbertSimilarityWithPipeline(
  text1: string,
  text2: string,
  extractor?: any
): Promise<number> {
  try {
    if (!extractor) {
      // Load pipeline on first call
      const pipelineInstance = await pipeline(
        'feature-extraction',
        SBERT_MODEL_ID,
        {
          quantized: true,
        } as PretrainedOptions
      );

      // Get embeddings for both texts
      const embeddings1 = await pipelineInstance(text1, {
        pooling: 'mean',
        normalize: true,
      });

      const embeddings2 = await pipelineInstance(text2, {
        pooling: 'mean',
        normalize: true,
      });

      // Calculate cosine similarity between embeddings
      const similarity = (embeddings1.data as number[]).reduce(
        (acc, val, idx) => {
          return acc + val * (embeddings2.data as number[])[idx];
        },
        0
      );

      // Return similarity score (already normalized)
      return Math.max(0, Math.min(1, similarity));
    } else {
      // Use provided pipeline instance
      const embeddings1 = await extractor(text1, {
        pooling: 'mean',
        normalize: true,
      });

      const embeddings2 = await extractor(text2, {
        pooling: 'mean',
        normalize: true,
      });

      // Calculate cosine similarity between embeddings
      const similarity = (embeddings1.data as number[]).reduce(
        (acc, val, idx) => {
          return acc + val * (embeddings2.data as number[])[idx];
        },
        0
      );

      // Return similarity score (already normalized)
      return Math.max(0, Math.min(1, similarity));
    }
  } catch (error) {
    console.error('Error calculating SBERT similarity:', error);
    // Return a default low score on error
    return 0;
  }
}

/**
 * Get the SBERT model configuration
 */
export function getSbertConfig(): {
  modelId: string;
  pooling: string;
  normalize: boolean;
  quantized: boolean;
} {
  return {
    modelId: SBERT_MODEL_ID,
    pooling: 'mean',
    normalize: true,
    quantized: true,
  };
}
