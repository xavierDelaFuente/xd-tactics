import type { Unit } from '@xd-tactics/domain';
import { useEffect, useState } from 'react';

export function useUnits() {
  const [units, setUnits] = useState<Unit[]>([]);

  useEffect(() => {
    let cancelled = false;

    fetch('/static/units')
      .then((response) => response.json())
      .then((data: Unit[]) => {
        if (!cancelled) {
          setUnits(data);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return units;
}
