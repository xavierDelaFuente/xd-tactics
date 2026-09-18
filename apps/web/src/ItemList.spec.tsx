// @vitest-environment jsdom
import { render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ItemList } from './ItemList';

const mockItems = [
  {
    apiName: 'TFT_Item_ForceOfNature',
    name: "Tactician's Crown",
    unique: false,
    associatedTraits: [],
    composition: ['TFT_Item_Spatula', 'TFT_Item_Spatula'],
  },
];

describe('ItemList', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ json: () => Promise.resolve(mockItems) }));
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("renders a fetched item's name and composition", async () => {
    render(<ItemList />);

    const row = await screen.findByRole('row', { name: /Tactician's Crown/ });
    expect(row).toHaveTextContent('TFT_Item_Spatula');
  });

  it('reports how many items are shown out of the total', async () => {
    render(<ItemList />);

    expect(await screen.findByText('Showing 1 of 1 items')).toBeInTheDocument();
  });
});
