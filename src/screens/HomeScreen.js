import React from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useApp } from '../context/AppContext';
import { COLORS, DIFFICULTY_COLOR } from '../theme';

const CARD_WIDTH = 220;

// 每日推荐大卡片
function RecommendCard({ dish, onPress }) {
  return (
    <TouchableOpacity style={styles.recCard} onPress={onPress} activeOpacity={0.85}>
      <View style={styles.recEmoji}>
        <Text style={styles.recEmojiText}>{dish.emoji}</Text>
      </View>
      <View style={styles.recInfo}>
        <Text style={styles.recName} numberOfLines={1}>{dish.name}</Text>
        <Text style={styles.recDesc} numberOfLines={2}>{dish.description}</Text>
        <View style={styles.recMeta}>
          <Text style={[styles.recTag, { color: DIFFICULTY_COLOR[dish.difficulty] || COLORS.accent }]}>
            {dish.difficulty}
          </Text>
          <Text style={styles.recTime}>⏱ {dish.time}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

// 菜系快捷入口卡片
function CuisineCard({ cuisine, count, onPress }) {
  return (
    <TouchableOpacity style={[styles.cuisineCard, { borderLeftColor: cuisine.color }]} onPress={onPress} activeOpacity={0.8}>
      <Text style={styles.cuisineEmoji}>{cuisine.emoji}</Text>
      <View style={{ flex: 1 }}>
        <Text style={styles.cuisineName}>{cuisine.name}</Text>
        <Text style={styles.cuisineCount}>{count} 道菜</Text>
      </View>
      <Text style={styles.cuisineArrow}>›</Text>
    </TouchableOpacity>
  );
}

export default function HomeScreen() {
  const navigation = useNavigation();
  const { cuisines, getDailyRecommended, getDishesByCuisine, orders, removeFromOrder, clearOrders } = useApp();
  const recommended = getDailyRecommended();

  const today = new Date();
  const dateStr = `${today.getMonth() + 1}月${today.getDate()}日`;
  const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
  const weekday = weekdays[today.getDay()];

  function goToDetail(dish) {
    navigation.navigate('Menu', {
      screen: 'DishDetail',
      params: { dish },
    });
  }

  function goToMenu(cuisineId) {
    navigation.navigate('Menu', {
      screen: 'MenuList',
      params: { initialCuisineId: cuisineId },
    });
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* 顶部头部 */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>老婆厨房 🍽️</Text>
            <Text style={styles.date}>{dateStr} {weekday}，今天吃什么？</Text>
          </View>
        </View>

        {/* 每日推荐 */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>今日推荐</Text>
            <Text style={styles.sectionSub}>每日三道，轮换推荐</Text>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.recList}
          >
            {recommended.map(dish => (
              <RecommendCard key={dish.id} dish={dish} onPress={() => goToDetail(dish)} />
            ))}
          </ScrollView>
        </View>

        {/* 今日菜单 */}
        {orders.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>今日菜单</Text>
              <Text style={styles.sectionSub}>{orders.length} 道</Text>
              <TouchableOpacity onPress={() => Alert.alert('清空菜单', '确定清空今日菜单？', [
                { text: '取消', style: 'cancel' },
                { text: '清空', style: 'destructive', onPress: clearOrders },
              ])} style={styles.clearBtn}>
                <Text style={styles.clearBtnText}>清空</Text>
              </TouchableOpacity>
            </View>
            {orders.map(dish => (
              <View key={dish.id} style={styles.orderItem}>
                <Text style={styles.orderEmoji}>{dish.emoji}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.orderName}>{dish.name}</Text>
                  <Text style={styles.orderMeta}>
                    <Text style={{ color: DIFFICULTY_COLOR[dish.difficulty] }}>{dish.difficulty}</Text>
                    {'  '}⏱ {dish.time}
                  </Text>
                </View>
                <TouchableOpacity onPress={() => removeFromOrder(dish.id)} style={styles.removeBtn}>
                  <Text style={styles.removeBtnText}>删除</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}

        {/* 菜系快速入口 */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>菜系分类</Text>
          </View>
          {cuisines.map(cuisine => (
            <CuisineCard
              key={cuisine.id}
              cuisine={cuisine}
              count={getDishesByCuisine(cuisine.id).length}
              onPress={() => goToMenu(cuisine.id)}
            />
          ))}
        </View>

        <View style={{ height: 24 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
  scroll: { flex: 1 },

  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
  },
  greeting: {
    fontSize: 24,
    fontWeight: '800',
    color: COLORS.text,
  },
  date: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 2,
  },

  section: { marginTop: 16 },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'baseline',
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
  },
  sectionSub: {
    fontSize: 12,
    color: COLORS.textLight,
    marginLeft: 8,
  },

  // 推荐卡片
  recList: { paddingHorizontal: 16, gap: 12 },
  recCard: {
    width: CARD_WIDTH,
    backgroundColor: COLORS.card,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  recEmoji: {
    height: 130,
    backgroundColor: '#FFF0E8',
    justifyContent: 'center',
    alignItems: 'center',
  },
  recEmojiText: { fontSize: 70 },
  recInfo: { padding: 14 },
  recName: {
    fontSize: 17,
    fontWeight: '700',
    color: COLORS.text,
  },
  recDesc: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 4,
    lineHeight: 18,
  },
  recMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    gap: 10,
  },
  recTag: {
    fontSize: 12,
    fontWeight: '600',
  },
  recTime: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },

  // 菜系卡片
  cuisineCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    marginHorizontal: 20,
    marginBottom: 10,
    borderRadius: 12,
    padding: 14,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  cuisineEmoji: { fontSize: 28, marginRight: 14 },
  cuisineName: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
  },
  cuisineCount: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  cuisineArrow: {
    fontSize: 20,
    color: COLORS.textLight,
    fontWeight: '300',
  },

  // 今日菜单
  orderItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    marginHorizontal: 20,
    marginBottom: 8,
    borderRadius: 12,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  orderEmoji: { fontSize: 32, marginRight: 12 },
  orderName: { fontSize: 15, fontWeight: '700', color: COLORS.text },
  orderMeta: { fontSize: 12, color: COLORS.textSecondary, marginTop: 3 },
  removeBtn: {
    backgroundColor: '#FFE8E8',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  removeBtnText: { fontSize: 13, color: '#E74C3C', fontWeight: '600' },
  clearBtn: {
    marginLeft: 'auto',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: '#FFE8E8',
  },
  clearBtnText: { fontSize: 12, color: '#E74C3C', fontWeight: '600' },
});
