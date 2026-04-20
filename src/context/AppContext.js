import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { INITIAL_CUISINES, INITIAL_DISHES } from '../data/initialData';

const AppContext = createContext(null);

const STORAGE_KEY_CUISINES        = '@laopo_kitchen_cuisines';
const STORAGE_KEY_DISHES          = '@laopo_kitchen_dishes';
const STORAGE_KEY_HISTORY         = '@laopo_kitchen_order_history';
const STORAGE_KEY_CURRENT_ORDERS  = '@laopo_kitchen_current_orders';
const STORAGE_KEY_ORDER_DATE      = '@laopo_kitchen_order_date';

function getTodayStr() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function getDateLabel(dateStr) {
  const [yyyy, mm, dd] = dateStr.split('-').map(Number);
  const d = new Date(yyyy, mm - 1, dd);
  const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
  return `${mm}月${dd}日 ${weekdays[d.getDay()]}`;
}

export function AppProvider({ children }) {
  const [cuisines, setCuisines] = useState(INITIAL_CUISINES);
  const [dishes, setDishes] = useState(INITIAL_DISHES);
  const [loaded, setLoaded] = useState(false);
  const [orders, setOrders] = useState([]); // 今日已点菜品
  const [orderHistory, setOrderHistory] = useState({}); // { 'YYYY-MM-DD': { date, dateLabel, dishes[] } }

  // 启动时从 AsyncStorage 读取用户新增的数据，合并到初始数据
  useEffect(() => {
    async function loadData() {
      try {
        const savedCuisines = await AsyncStorage.getItem(STORAGE_KEY_CUISINES);
        const savedDishes = await AsyncStorage.getItem(STORAGE_KEY_DISHES);

        if (savedCuisines) {
          const extra = JSON.parse(savedCuisines);
          // 用 id 去重，避免重复
          setCuisines(prev => {
            const ids = new Set(prev.map(c => c.id));
            return [...prev, ...extra.filter(c => !ids.has(c.id))];
          });
        }
        if (savedDishes) {
          const extra = JSON.parse(savedDishes);
          setDishes(prev => {
            const ids = new Set(prev.map(d => d.id));
            return [...prev, ...extra.filter(d => !ids.has(d.id))];
          });
        }

        // 加载历史记录 + 今日菜单
        const savedHistory = await AsyncStorage.getItem(STORAGE_KEY_HISTORY);
        const savedOrders  = await AsyncStorage.getItem(STORAGE_KEY_CURRENT_ORDERS);
        const savedDate    = await AsyncStorage.getItem(STORAGE_KEY_ORDER_DATE);

        const historyMap    = savedHistory ? JSON.parse(savedHistory) : {};
        let   currentOrders = savedOrders  ? JSON.parse(savedOrders)  : [];
        const storedDate    = savedDate || null;

        // 跨日自动归档：上次记录日期不是今天，且有菜单数据
        if (storedDate && storedDate !== getTodayStr() && currentOrders.length > 0) {
          historyMap[storedDate] = {
            date: storedDate,
            dateLabel: getDateLabel(storedDate),
            dishes: currentOrders,
          };
          await AsyncStorage.setItem(STORAGE_KEY_HISTORY, JSON.stringify(historyMap));
          await AsyncStorage.multiRemove([STORAGE_KEY_CURRENT_ORDERS, STORAGE_KEY_ORDER_DATE]);
          currentOrders = [];
        }

        setOrderHistory(historyMap);
        setOrders(currentOrders);
      } catch (e) {
        console.warn('加载数据失败', e);
      } finally {
        setLoaded(true);
      }
    }
    loadData();
  }, []);

  // 持久化今日菜单到 AsyncStorage
  useEffect(() => {
    if (!loaded) return;
    AsyncStorage.setItem(STORAGE_KEY_CURRENT_ORDERS, JSON.stringify(orders)).catch(() => {});
    if (orders.length > 0) {
      AsyncStorage.setItem(STORAGE_KEY_ORDER_DATE, getTodayStr()).catch(() => {});
    }
  }, [orders, loaded]);

  // 加入今日菜单（去重）
  function addToOrder(dish) {
    setOrders(prev => {
      if (prev.find(d => d.id === dish.id)) return prev;
      return [...prev, dish];
    });
  }

  // 从今日菜单移除
  function removeFromOrder(dishId) {
    setOrders(prev => prev.filter(d => d.id !== dishId));
  }

  // 清空今日菜单
  function clearOrders() {
    setOrders([]);
    AsyncStorage.multiRemove([STORAGE_KEY_CURRENT_ORDERS, STORAGE_KEY_ORDER_DATE]).catch(() => {});
  }

  // 清空历史记录
  async function clearHistory() {
    setOrderHistory({});
    await AsyncStorage.removeItem(STORAGE_KEY_HISTORY).catch(() => {});
  }

  // 新增菜系
  async function addCuisine(cuisine) {
    const newCuisine = { ...cuisine, id: `custom_c_${Date.now()}` };
    setCuisines(prev => [...prev, newCuisine]);
    try {
      const saved = await AsyncStorage.getItem(STORAGE_KEY_CUISINES);
      const existing = saved ? JSON.parse(saved) : [];
      await AsyncStorage.setItem(
        STORAGE_KEY_CUISINES,
        JSON.stringify([...existing, newCuisine])
      );
    } catch (e) {
      console.warn('保存菜系失败', e);
    }
    return newCuisine;
  }

  // 新增菜品
  async function addDish(dish) {
    const newDish = { ...dish, id: `custom_d_${Date.now()}` };
    setDishes(prev => [...prev, newDish]);
    try {
      const saved = await AsyncStorage.getItem(STORAGE_KEY_DISHES);
      const existing = saved ? JSON.parse(saved) : [];
      await AsyncStorage.setItem(
        STORAGE_KEY_DISHES,
        JSON.stringify([...existing, newDish])
      );
    } catch (e) {
      console.warn('保存菜品失败', e);
    }
    return newDish;
  }

  // 获取某菜系的所有菜品
  function getDishesByCuisine(cuisineId) {
    return dishes.filter(d => d.cuisineId === cuisineId);
  }

  // 根据日期固定随机选 3 道菜作为每日推荐
  function getDailyRecommended() {
    const today = new Date();
    const seed = today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate();
    const shuffled = [...dishes].sort((a, b) => {
      const ha = hashCode(a.id + seed);
      const hb = hashCode(b.id + seed);
      return ha - hb;
    });
    return shuffled.slice(0, 3);
  }

  function hashCode(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = (Math.imul(31, hash) + str.charCodeAt(i)) | 0;
    }
    return hash;
  }

  const sortedOrderHistory = Object.values(orderHistory).sort((a, b) =>
    b.date.localeCompare(a.date)
  );

  return (
    <AppContext.Provider
      value={{ cuisines, dishes, loaded, orders, addToOrder, removeFromOrder, clearOrders, addCuisine, addDish, getDishesByCuisine, getDailyRecommended, orderHistory: sortedOrderHistory, clearHistory }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
