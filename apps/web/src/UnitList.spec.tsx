// @vitest-environment jsdom
import { render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { UnitList } from './UnitList';

const mockUnits = [
  {
    apiName: 'DA_Gromp18_AP',
    name: 'Gromp',
    cost: 2,
    traits: ['Riftbeast', 'Adaptor'],
    stats: { hp: 550, armor: 30, mr: 30, ad: 30, as: 0.7, range: 4 },
    ability: { name: 'Belchy Bubble', mana: 45, variables: [] },
  },
];

describe('UnitList', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ json: () => Promise.resolve(mockUnits) }));
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("renders a fetched unit's name and cost", async () => {
    render(<UnitList />);

    const row = await screen.findByRole('row', { name: /Gromp/ });
    expect(row).toHaveTextContent('2');
  });
});
