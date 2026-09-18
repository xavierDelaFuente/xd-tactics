import type { Unit } from '@xd-tactics/domain';
import { useJsonList } from './useJsonList';

export function useUnits() {
  return useJsonList<Unit>('/static/units');
}
