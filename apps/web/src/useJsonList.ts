import { useEffect, useState } from 'react';

export function useJsonList<T>(url: string): T[] {
  const [items, setItems] = useState<T[]>([]);

  useEffect(() => {
    let cancelled = false;

    fetch(url)
      .then((response) => response.json())
      .then((data: T[]) => {
        if (!cancelled) {
          setItems(data);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [url]);

  return items;
}
