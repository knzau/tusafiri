import { describe, expect, it } from 'vitest';

import { daySummary, howItWorks, landingContent, numberedPins } from './landing.content';

describe('landing content', () => {
  it('keeps the landing headline and the three steps', () => {
    expect(landingContent.headline).toBe('Plan a trip on a map. Share it as one page.');
    expect(howItWorks.map((step) => step.label)).toEqual([
      'Collect places from anywhere',
      'Shape them into days',
      'Share one page',
    ]);
  });

  it('places one pin group for each day of the demo trip', () => {
    expect(numberedPins).toHaveLength(6);
    expect(daySummary.map((day) => day.day)).toEqual([1, 2, 3]);
  });
});
