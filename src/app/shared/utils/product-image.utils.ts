export type ProductImageVariant = 'original' | 'medium' | 'small';

const VARIANT_PRIORITIES: Record<ProductImageVariant, readonly string[]> = {
  original: ['original', 'medium', 'small'],
  medium: ['medium', 'small', 'original'],
  small: ['small', 'medium', 'original'],
};

const LEGACY_IMAGE_FIELDS = [
  'secureUrl',
  'url',
  'path',
  'fileName',
  'filename',
  'name',
  'id',
] as const;

const buildCandidateFields = (variant: ProductImageVariant): string[] => [
  ...VARIANT_PRIORITIES[variant],
  ...LEGACY_IMAGE_FIELDS,
];

export function resolveProductImageValue(value: unknown, variant: ProductImageVariant): string | null {
  if (typeof value === 'string') {
    const trimmed = value.trim();
    return trimmed || null;
  }

  if (typeof value !== 'object' || value === null) {
    return null;
  }

  const record = value as Record<string, unknown>;
  for (const field of buildCandidateFields(variant)) {
    const candidate = record[field];
    if (typeof candidate === 'string') {
      const trimmed = candidate.trim();
      if (trimmed) {
        return trimmed;
      }
    }
  }

  return null;
}
