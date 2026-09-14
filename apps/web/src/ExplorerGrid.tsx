import type { ExplorerRow } from '@xd-tactics/contracts';
import { useEffect, useState } from 'react';

export function ExplorerGrid() {
  const [rows, setRows] = useState<ExplorerRow[]>([]);

  useEffect(() => {
    let cancelled = false;

    fetch('/explorer?pivot=unit')
      .then((response) => response.json())
      .then((data: ExplorerRow[]) => {
        if (!cancelled) {
          setRows(data);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

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
