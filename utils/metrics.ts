/**
 * Calculates a simple token overlap score (Jaccard Index) as a proxy for ROUGE-1.
 * This is used when a user provides a reference comment to compare against.
 */
export const calculateTokenOverlap = (generated: string, reference: string): number => {
  if (!generated || !reference) return 0;

  const tokenize = (str: string) => {
    return new Set(
      str.toLowerCase()
        .replace(/[^\w\s]/g, '') // Remove punctuation
        .split(/\s+/)
        .filter(t => t.length > 0)
    );
  };

  const genTokens = tokenize(generated);
  const refTokens = tokenize(reference);

  if (refTokens.size === 0) return 0;

  let intersection = 0;
  genTokens.forEach(token => {
    if (refTokens.has(token)) {
      intersection++;
    }
  });

  const union = new Set([...genTokens, ...refTokens]).size;
  
  // Return percentage
  return union === 0 ? 0 : (intersection / union) * 100;
};

/**
 * Calculates length ratio between generated and reference.
 * Closer to 1.0 is generally better for conciseness consistency.
 */
export const calculateLengthRatio = (generated: string, reference: string): number => {
  if (!reference || reference.length === 0) return 0;
  return generated.length / reference.length;
};

export const truncateCode = (code: string, maxLength: number = 30): string => {
    const inline = code.replace(/\s+/g, ' ').trim();
    if (inline.length <= maxLength) return inline;
    return inline.substring(0, maxLength) + '...';
}