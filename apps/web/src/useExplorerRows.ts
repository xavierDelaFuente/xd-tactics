import type { ExplorerRow } from '@xd-tactics/contracts';
import { useJsonList } from './useJsonList';

export function useExplorerRows(pivot = 'unit') {
  return useJsonList<ExplorerRow>(`/explorer?pivot=${pivot}`);
}
