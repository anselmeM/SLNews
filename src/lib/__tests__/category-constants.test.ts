import { describe, it, expect } from 'vitest';
import { CATEGORY_ALIASES, CANONICAL_CATEGORIES, normalizeCategory } from '@/lib/category-constants';

describe('category-constants', () => {
  it('normalizes Local to National', () => {
    expect(normalizeCategory('Local')).toBe('National');
    expect(normalizeCategory(' District ')).toBe('National');
    expect(normalizeCategory('Provincial')).toBe('National');
  });

  it('normalizes compound politics and economy categories', () => {
    expect(normalizeCategory('Politics & Law')).toBe('Politics');
    expect(normalizeCategory('Economy & Business')).toBe('Economy');
  });

  it('preserves canonical categories without modification', () => {
    expect(normalizeCategory('World')).toBe('World');
    expect(normalizeCategory('Sports')).toBe('Sports');
    expect(normalizeCategory('Tech')).toBe('Tech');
  });

  it('falls back to National on empty strings', () => {
    expect(normalizeCategory('')).toBe('National');
    expect(normalizeCategory('   ')).toBe('National');
  });

  it('contains expected canonical categories array and aliases map', () => {
    expect(CANONICAL_CATEGORIES).toContain('National');
    expect(CANONICAL_CATEGORIES).toContain('Politics');
    expect(CANONICAL_CATEGORIES).toContain('Economy');
    expect(CATEGORY_ALIASES['Local']).toBe('National');
    expect(CATEGORY_ALIASES['Politics & Law']).toBe('Politics');
  });
});
