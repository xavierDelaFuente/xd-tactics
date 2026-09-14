import type { ExplorerRow } from '@xd-tactics/contracts';
import { useEffect, useState } from 'react';

export function useExplorerRows(pivot = 'unit') {
  const [rows, setRows] = useState<ExplorerRow[]>([]);

  useEffect(() => {
    let cancelled = false;

    fetch(`/explorer?pivot=${pivot}`)
      .then((response) => response.json())
      .then((data: ExplorerRow[]) => {
        if (!cancelled) {
          setRows(data);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [pivot]);

  return rows;
}
