// @vitest-environment jsdom
import { render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { TraitList } from './TraitList';

const mockTraits = [
  {
    apiName: 'DA_18_Elderwood',
    name: 'Elderwood',
    tiers: [
      { minUnits: 3, maxUnits: 4, style: 1 },
      { minUnits: 5, maxUnits: 6, style: 3 },
    ],
  },
];

describe('TraitList', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ json: () => Promise.resolve(mockTraits) }));
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("renders a fetched trait's name and tier thresholds", async () => {
    render(<TraitList />);

    const row = await screen.findByRole('row', { name: /Elderwood/ });
    expect(row).toHaveTextContent('3, 5');
  });
});
