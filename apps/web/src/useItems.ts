import type { Item } from '@xd-tactics/domain';
import { useJsonList } from './useJsonList';

export function useItems() {
  return useJsonList<Item>('/static/items');
}
