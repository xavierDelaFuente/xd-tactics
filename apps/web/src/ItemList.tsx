import { useItems } from './useItems';

// 769 items is the real count for this set — too many to usefully render unstyled on one
// page, and rendering all of them was the actual cause of intermittent e2e timeouts elsewhere
// on the page (main thread blocked reconciling hundreds of rows). Capped until there's a
// real UI for browsing/filtering; the count stays honest rather than silently truncated.
const DISPLAY_LIMIT = 30;

export function ItemList() {
  const items = useItems();
  const visibleItems = items.slice(0, DISPLAY_LIMIT);

  return (
    <>
      <p>
        Showing {visibleItems.length} of {items.length} items
      </p>
      <table aria-label="Items">
        <thead>
          <tr>
            <th>Name</th>
            <th>Composition</th>
            <th>Unique</th>
          </tr>
        </thead>
        <tbody>
          {visibleItems.map((item) => (
            <tr key={item.apiName}>
              <td>{item.name}</td>
              <td>{item.composition.join(' + ')}</td>
              <td>{item.unique ? 'Yes' : 'No'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}
