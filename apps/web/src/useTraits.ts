import type { Trait } from '@xd-tactics/domain';
import { useJsonList } from './useJsonList';

export function useTraits() {
  return useJsonList<Trait>('/static/traits');
}
