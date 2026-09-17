import { useExplorerRows } from './useExplorerRows';

export function ExplorerGrid() {
  const rows = useExplorerRows();

  return (
    <table>
      <thead>
        <tr>
          <th>Name</th>
          <th>Avg Place</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => (
          <tr key={row.key}>
            <td>{row.name}</td>
            <td>{row.avgPlace}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
