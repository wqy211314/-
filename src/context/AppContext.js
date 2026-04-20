import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { INITIAL_CUISINES, INITIAL_DISHES } from '../data/initialData';

const AppContext = createContext(null);

const STORAGE_KEY_CUISINES = '@laopo_kitchen_cuisines';
const STORAGE_KEY_DISHES = '@laopo_kitchen_dishes';

export function AppProvider({ children }) {
  const [cuisines, setCuisines] = useState(INITIAL_CUISINES);
  const [dishes, setDishes] = useState(INITIAL_DISHES);
  const [loaded, setLoaded] = useState(false);
  const [orders, setOrders] = useState([]); // 今日已点菜品

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
      } catch (e) {
        console.warn('加载数据失败', e);
      } finally {
        setLoaded(true);
      }
    }
    loadData();
  }, []);

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

  return (
    <AppContext.Provider
      value={{ cuisines, dishes, loaded, orders, addToOrder, removeFromOrder, clearOrders, addCuisine, addDish, getDishesByCuisine, getDailyRecommended }}
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
