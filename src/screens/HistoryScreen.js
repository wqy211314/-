import React from 'react';
import {
  View, Text, FlatList, TouchableOpacity,
  StyleSheet, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useApp } from '../context/AppContext';
import { COLORS, DIFFICULTY_COLOR } from '../theme';

function DishRow({ dish }) {
  return (
    <View style={styles.dishRow}>
      <Text style={styles.dishEmoji}>{dish.emoji}</Text>
      <Text style={styles.dishName} numberOfLines={1}>{dish.name}</Text>
      <View style={styles.dishMeta}>
        <Text style={[styles.dishDiff, { color: DIFFICULTY_COLOR[dish.difficulty] || COLORS.accent }]}>
          {dish.difficulty}
        </Text>
        <Text style={styles.dishTime}>⏱ {dish.time}</Text>
      </View>
    </View>
  );
}

function HistoryEntry({ entry }) {
  return (
    <View style={styles.entryCard}>
      <View style={styles.dateHeader}>
        <Text style={styles.dateLabel}>{entry.dateLabel}</Text>
        <Text style={styles.dishCount}>{entry.dishes.length} 道</Text>
      </View>
      {entry.dishes.map((dish, idx) => (
        <DishRow key={dish.id ?? idx} dish={dish} />
      ))}
    </View>
  );
}

export default function HistoryScreen() {
  const { orderHistory, clearHistory } = useApp();

  const totalDishes = orderHistory.reduce((sum, e) => sum + e.dishes.length, 0);

  function handleClearHistory() {
    Alert.alert('清空历史', '确定清空所有历史记录？', [
      { text: '取消', style: 'cancel' },
      { text: '清空', style: 'destructive', onPress: clearHistory },
    ]);
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* 顶部标题栏 */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>历史记录</Text>
        {totalDishes > 0 && (
          <Text style={styles.headerSub}>共 {totalDishes} 道</Text>
        )}
        {orderHistory.length > 0 && (
          <TouchableOpacity onPress={handleClearHistory} style={styles.clearBtn}>
            <Text style={styles.clearBtnText}>清空</Text>
          </TouchableOpacity>
        )}
      </View>

      <FlatList
        data={orderHistory}
        keyExtractor={item => item.date}
        renderItem={({ item }) => <HistoryEntry entry={item} />}
        contentContainerStyle={[
          styles.listContent,
          orderHistory.length === 0 && styles.emptyContainer,
        ]}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyInner}>
            <Text style={styles.emptyIcon}>📭</Text>
            <Text style={styles.emptyText}>暂无历史记录</Text>
            <Text style={styles.emptyHint}>加入今日菜单，隔日自动归档</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },

  header: {
    flexDirection: 'row',
    alignItems: 'baseline',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.text,
  },
  headerSub: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginLeft: 8,
  },
  clearBtn: {
    marginLeft: 'auto',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: '#FFE8E8',
  },
  clearBtnText: {
    fontSize: 12,
    color: '#E74C3C',
    fontWeight: '600',
  },

  listContent: { paddingHorizontal: 16, paddingBottom: 24 },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyInner: { alignItems: 'center' },
  emptyIcon: { fontSize: 56 },
  emptyText: {
    color: COLORS.text,
    marginTop: 14,
    fontSize: 16,
    fontWeight: '700',
  },
  emptyHint: {
    color: COLORS.textSecondary,
    marginTop: 6,
    fontSize: 13,
  },

  entryCard: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  dateHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: 10,
    marginBottom: 4,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  dateLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.text,
    flex: 1,
  },
  dishCount: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },

  dishRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 7,
  },
  dishEmoji: { fontSize: 26, marginRight: 12 },
  dishName: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
  },
  dishMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dishDiff: { fontSize: 12, fontWeight: '600' },
  dishTime: { fontSize: 12, color: COLORS.textSecondary },
});
