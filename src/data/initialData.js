import { CHUANCAI_DISHES } from './chuancai';
import { YUECAI_DISHES } from './yuecai';
import { XIANGCAI_DISHES } from './xiangcai';
import { JIACHANG_DISHES } from './jiachang';

export const INITIAL_CUISINES = [
  { id: 'c1', name: '川菜', emoji: '🌶️', color: '#E8572A' },
  { id: 'c2', name: '粤菜', emoji: '🦐', color: '#FF8C00' },
  { id: 'c3', name: '湘菜', emoji: '🥩', color: '#DC143C' },
  { id: 'c4', name: '家常菜', emoji: '🍳', color: '#2E8B57' },
];

export const INITIAL_DISHES = [
  ...CHUANCAI_DISHES,
  ...YUECAI_DISHES,
  ...XIANGCAI_DISHES,
  ...JIACHANG_DISHES,
];
