/**
 * Grade helpers shared by the mock API and by pages that need a live
 * preview (e.g. the grading screen). The real backend should use the
 * same formula so numbers match.
 */

/** Average of the numeric values in a list, or null when there are none. */
export function average(values) {
  const nums = values.filter((v) => typeof v === 'number' && !Number.isNaN(v));
  if (nums.length === 0) return null;
  return nums.reduce((sum, v) => sum + v, 0) / nums.length;
}

/**
 * Weighted final grade.
 *
 * Missing components (for example a final exam that has not happened yet)
 * are left out and the remaining weights are re-normalised, so the result
 * is a projection. `partial` tells the UI to label it as such.
 *
 * @param {{homework: number|null, midterm: number|null, final: number|null}} parts
 * @param {{homework: number, midterm: number, final: number}} weights percentages
 */
export function weightedFinal(parts, weights) {
  const keys = ['homework', 'midterm', 'final'];
  const present = keys.filter((k) => typeof parts[k] === 'number' && !Number.isNaN(parts[k]));
  const weightSum = present.reduce((sum, k) => sum + weights[k], 0);
  if (weightSum === 0) return { total: null, partial: true, breakdown: [] };

  const breakdown = keys.map((k) => {
    const has = present.includes(k);
    return {
      key: k,
      score: has ? parts[k] : null,
      weight: weights[k],
      contribution: has ? (parts[k] * weights[k]) / 100 : null,
    };
  });
  const total = present.reduce((sum, k) => sum + parts[k] * weights[k], 0) / weightSum;
  return { total, partial: present.length < keys.length, breakdown };
}

/** Letter-style band used for colouring grades. */
export function gradeTone(score) {
  if (score == null) return 'gray';
  if (score >= 85) return 'green';
  if (score >= 70) return 'blue';
  if (score >= 60) return 'amber';
  return 'red';
}
