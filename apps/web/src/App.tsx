import { Demo } from './Demo';
import { ExplorerGrid } from './ExplorerGrid';
import { ItemList } from './ItemList';
import { TraitList } from './TraitList';
import { UnitList } from './UnitList';

export function App() {
  return (
    <>
      <Demo />
      <ExplorerGrid />
      <h2>Units</h2>
      <UnitList />
      <h2>Items</h2>
      <ItemList />
      <h2>Traits</h2>
      <TraitList />
    </>
  );
}
