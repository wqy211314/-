import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  View, Text, FlatList, TouchableOpacity,
  TextInput, StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useApp } from '../context/AppContext';
import { COLORS, DIFFICULTY_COLOR } from '../theme';

const SIDEBAR_WIDTH = 52;

// 左侧菜系导航项（只显示 emoji，够紧凑）
function CategoryItem({ cuisine, isActive, onPress }) {
  return (
    <TouchableOpacity
      style={[styles.catItem, isActive && styles.catItemActive]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      {isActive && <View style={[styles.catIndicator, { backgroundColor: cuisine.color }]} />}
      <Text style={styles.catEmoji}>{cuisine.emoji}</Text>
      <Text
        style={[styles.catName, isActive && { color: cuisine.color, fontWeight: '700' }]}
        numberOfLines={1}
      >
        {cuisine.name}
      </Text>
    </TouchableOpacity>
  );
}

// 右侧菜品卡片（两列网格）
function DishCard({ dish, onPress }) {
  return (
    <TouchableOpacity style={styles.dishCard} onPress={onPress} activeOpacity={0.8}>
      <View style={styles.dishEmoji}>
        <Text style={styles.dishEmojiText}>{dish.emoji}</Text>
      </View>
      <View style={styles.dishInfo}>
        <Text style={styles.dishName} numberOfLines={2}>{dish.name}</Text>
        <View style={styles.dishMeta}>
          <Text style={[styles.dishDiff, { color: DIFFICULTY_COLOR[dish.difficulty] || COLORS.accent }]} numberOfLines={1}>
            {dish.difficulty}
          </Text>
          <Text style={styles.dishTime} numberOfLines={1}>{dish.time}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

export default function MenuScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { cuisines, getDishesByCuisine } = useApp();

  const initialCuisineId = route.params?.initialCuisineId ?? cuisines[0]?.id;
  const [activeCuisineId, setActiveCuisineId] = useState(initialCuisineId);
  const [query, setQuery] = useState('');
  const dishListRef = useRef(null);

  // 当从首页带参跳转时更新选中菜系
  useEffect(() => {
    if (route.params?.initialCuisineId) {
      setActiveCuisineId(route.params.initialCuisineId);
    }
  }, [route.params?.initialCuisineId]);

  const activeCuisine = cuisines.find(c => c.id === activeCuisineId) ?? cuisines[0];

  // 根据搜索词过滤菜品
  const displayDishes = useMemo(() => {
    const raw = getDishesByCuisine(activeCuisineId);
    if (!query.trim()) return raw;
    const q = query.trim().toLowerCase();
    return raw.filter(d =>
      d.name.toLowerCase().includes(q) ||
      (d.tags && d.tags.some(t => t.toLowerCase().includes(q)))
    );
  }, [activeCuisineId, query, getDishesByCuisine]);

  const handleSelectCuisine = useCallback((id) => {
    setActiveCuisineId(id);
    setQuery('');
    dishListRef.current?.scrollToOffset({ offset: 0, animated: false });
  }, []);

  function goToDetail(dish) {
    navigation.navigate('DishDetail', { dish });
  }

  const renderDish = useCallback(({ item }) => (
    <DishCard dish={item} onPress={() => goToDetail(item)} />
  ), []);

  const renderCategory = useCallback(({ item: cuisine }) => {
    return (
      <CategoryItem
        cuisine={cuisine}
        isActive={cuisine.id === activeCuisineId}
        onPress={() => handleSelectCuisine(cuisine.id)}
      />
    );
  }, [activeCuisineId, handleSelectCuisine]);

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      {/* 搜索栏 */}
      <View style={styles.searchBar}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={styles.searchInput}
          placeholder={`在${activeCuisine?.name ?? ''}中搜索菜品…`}
          placeholderTextColor={COLORS.textLight}
          value={query}
          onChangeText={setQuery}
          returnKeyType="search"
          clearButtonMode="while-editing"
        />
      </View>

      <View style={styles.body}>
        {/* 左侧菜系导航 —— 用 View 包裹，强制锁定宽度 */}
        <View style={styles.sidebar}>
          <FlatList
            data={cuisines}
            keyExtractor={item => item.id}
            renderItem={renderCategory}
            showsVerticalScrollIndicator={false}
            style={{ flex: 1 }}
          />
        </View>

        {/* 右侧菜品区 */}
        <View style={styles.dishArea}>
          {/* 当前菜系标题 */}
          <View style={[styles.dishAreaHeader, { borderBottomColor: activeCuisine?.color ?? COLORS.primary }]}>
            <Text style={[styles.dishAreaTitle, { color: activeCuisine?.color ?? COLORS.primary }]}>
              {activeCuisine?.emoji} {activeCuisine?.name}
            </Text>
            <Text style={styles.dishAreaCount}>共 {displayDishes.length} 道</Text>
          </View>

          {displayDishes.length === 0 ? (
            <View style={styles.empty}>
              <Text style={styles.emptyIcon}>🍽️</Text>
              <Text style={styles.emptyText}>暂无符合的菜品</Text>
            </View>
          ) : (
          <FlatList
              ref={dishListRef}
              data={displayDishes}
              keyExtractor={item => item.id}
              renderItem={renderDish}
              numColumns={2}
              columnWrapperStyle={styles.row}
              contentContainerStyle={styles.dishList}
              showsVerticalScrollIndicator={false}
            />
          )}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },

  // 搜索栏
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    marginHorizontal: 12,
    marginVertical: 8,
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 42,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  searchIcon: { fontSize: 16, marginRight: 8 },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: COLORS.text,
  },

  // 主体布局
  body: { flex: 1, flexDirection: 'row' },

  // 左侧导航
  sidebar: {
    width: SIDEBAR_WIDTH,
    flexShrink: 0,
    backgroundColor: COLORS.sidebar,
    overflow: 'hidden',
  },
  catItem: {
    paddingVertical: 10,
    paddingHorizontal: 2,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    position: 'relative',
  },
  catItemActive: {
    backgroundColor: COLORS.sidebarActive ?? '#FFF0E8',
  },
  catEmoji: { fontSize: 18 },
  catName: {
    fontSize: 10,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: 2,
    fontWeight: '500',
  },
  catIndicator: {
    position: 'absolute',
    left: 0,
    top: '20%',
    bottom: '20%',
    width: 3,
    borderRadius: 2,
  },

  // 右侧菜品区
  dishArea: { flex: 1, backgroundColor: COLORS.background, overflow: 'hidden' },
  dishAreaHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 2,
    backgroundColor: COLORS.card,
  },
  dishAreaTitle: {
    fontSize: 15,
    fontWeight: '700',
  },
  dishAreaCount: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },

  dishList: { padding: 6 },
  row: { gap: 8, paddingHorizontal: 6, marginBottom: 0 },

  dishCard: {
    flex: 1,
    backgroundColor: COLORS.card,
    borderRadius: 12,
    marginBottom: 8,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.07,
    shadowRadius: 4,
    elevation: 2,
  },
  dishEmoji: {
    height: 90,
    backgroundColor: '#FFF0E8',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dishEmojiText: { fontSize: 48 },
  dishInfo: { padding: 8 },
  dishName: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.text,
    lineHeight: 18,
  },
  dishMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 6,
  },
  dishDiff: { fontSize: 11, fontWeight: '600' },
  dishTime: { fontSize: 11, color: COLORS.textSecondary },

  // 空态
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingTop: 80 },
  emptyIcon: { fontSize: 48 },
  emptyText: { color: COLORS.textSecondary, marginTop: 12, fontSize: 14 },
});
