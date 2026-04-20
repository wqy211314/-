import React from 'react';
import {
  View, Text, ScrollView, StyleSheet,
  TouchableOpacity, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute } from '@react-navigation/native';
import { useApp } from '../context/AppContext';
import { COLORS, DIFFICULTY_COLOR } from '../theme';

export default function DishDetailScreen() {
  const route = useRoute();
  const { dish } = route.params;
  const { orders, addToOrder, removeFromOrder } = useApp();

  const isOrdered = orders.some(d => d.id === dish.id);

  function handleOrder() {
    if (isOrdered) {
      removeFromOrder(dish.id);
    } else {
      addToOrder(dish);
      Alert.alert('已加入', `「${dish.name}」已加入今日菜单 ✅`);
    }
  }

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* 顶部 emoji 展示区 */}
        <View style={styles.hero}>
          <Text style={styles.heroEmoji}>{dish.emoji}</Text>
        </View>

        {/* 基本信息 */}
        <View style={styles.infoCard}>
          <Text style={styles.dishName}>{dish.name}</Text>
          <Text style={styles.description}>{dish.description}</Text>

          {/* 标签 */}
          {dish.tags?.length > 0 && (
            <View style={styles.tags}>
              {dish.tags.map(tag => (
                <View key={tag} style={styles.tag}>
                  <Text style={styles.tagText}>{tag}</Text>
                </View>
              ))}
            </View>
          )}

          {/* 元数据：难度 / 时间 / 份量 */}
          <View style={styles.metaRow}>
            <MetaItem icon="📊" label="难度" value={dish.difficulty} valueColor={DIFFICULTY_COLOR[dish.difficulty]} />
            <View style={styles.metaDivider} />
            <MetaItem icon="⏱" label="时长" value={dish.time} />
            <View style={styles.metaDivider} />
            <MetaItem icon="👥" label="份量" value={dish.servings} />
          </View>
        </View>

        {/* 配料清单 */}
        <SectionTitle title="🧂 配料清单" count={dish.ingredients?.length} />
        <View style={styles.ingredientsGrid}>
          {dish.ingredients?.map((ing, idx) => (
            <View key={idx} style={styles.ingItem}>
              <Text style={styles.ingName}>{ing.name}</Text>
              <Text style={styles.ingAmount}>{ing.amount}</Text>
            </View>
          ))}
        </View>

        {/* 烹饪步骤 */}
        <SectionTitle title="👨‍🍳 烹饪步骤" count={dish.steps?.length} />
        <View style={styles.steps}>
          {dish.steps?.map((step, idx) => (
            <View key={idx} style={styles.stepRow}>
              <View style={styles.stepNum}>
                <Text style={styles.stepNumText}>{idx + 1}</Text>
              </View>
              <Text style={styles.stepText}>{step}</Text>
            </View>
          ))}
        </View>

        <View style={{ height: 32 }} />

        {/* 加入今日菜单 */}
        <TouchableOpacity
          style={[styles.orderBtn, isOrdered && styles.orderBtnActive]}
          onPress={handleOrder}
          activeOpacity={0.85}
        >
          <Text style={styles.orderBtnText}>
            {isOrdered ? '✅ 已加入今日菜单（点击取消）' : '＋ 加入今日菜单'}
          </Text>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

function MetaItem({ icon, label, value, valueColor }) {
  return (
    <View style={styles.metaItem}>
      <Text style={styles.metaIcon}>{icon}</Text>
      <Text style={styles.metaLabel}>{label}</Text>
      <Text style={[styles.metaValue, valueColor && { color: valueColor }]}>{value}</Text>
    </View>
  );
}

function SectionTitle({ title, count }) {
  return (
    <View style={styles.sectionTitle}>
      <Text style={styles.sectionTitleText}>{title}</Text>
      {count != null && <Text style={styles.sectionCount}>{count} 项</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
  scroll: { flex: 1 },

  // 顶部 emoji 区
  hero: {
    height: 200,
    backgroundColor: '#FFF0E8',
    justifyContent: 'center',
    alignItems: 'center',
  },
  heroEmoji: { fontSize: 100 },

  // 信息卡
  infoCard: {
    backgroundColor: COLORS.card,
    marginHorizontal: 16,
    marginTop: -20,
    borderRadius: 16,
    padding: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  dishName: {
    fontSize: 24,
    fontWeight: '800',
    color: COLORS.text,
  },
  description: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 20,
    marginTop: 6,
  },

  // 标签
  tags: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 12, gap: 6 },
  tag: {
    backgroundColor: '#FFF0E8',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  tagText: { fontSize: 12, color: COLORS.primary, fontWeight: '600' },

  // 元数据
  metaRow: {
    flexDirection: 'row',
    marginTop: 16,
    backgroundColor: COLORS.background,
    borderRadius: 12,
    padding: 12,
    justifyContent: 'space-around',
  },
  metaItem: { alignItems: 'center', flex: 1 },
  metaIcon: { fontSize: 20 },
  metaLabel: { fontSize: 11, color: COLORS.textSecondary, marginTop: 4 },
  metaValue: { fontSize: 13, fontWeight: '700', color: COLORS.text, marginTop: 2 },
  metaDivider: { width: 1, backgroundColor: COLORS.border, marginVertical: 4 },

  // 区块标题
  sectionTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginTop: 24,
    marginBottom: 10,
  },
  sectionTitleText: { fontSize: 17, fontWeight: '700', color: COLORS.text },
  sectionCount: { fontSize: 12, color: COLORS.textSecondary, marginLeft: 8 },

  // 配料网格（两列）
  ingredientsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: 12,
    gap: 8,
  },
  ingItem: {
    width: '48%',
    backgroundColor: COLORS.card,
    borderRadius: 10,
    padding: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  ingName: { fontSize: 13, fontWeight: '600', color: COLORS.text },
  ingAmount: { fontSize: 12, color: COLORS.primary, fontWeight: '700' },

  // 步骤
  steps: { marginHorizontal: 16, gap: 12 },
  stepRow: {
    flexDirection: 'row',
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  stepNum: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    flexShrink: 0,
  },
  stepNumText: { color: '#fff', fontSize: 13, fontWeight: '800' },
  stepText: { flex: 1, fontSize: 14, color: COLORS.text, lineHeight: 22 },

  // 下单按钮
  orderBtn: {
    marginHorizontal: 16,
    marginTop: 8,
    backgroundColor: COLORS.primary,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  orderBtnActive: {
    backgroundColor: '#27AE60',
  },
  orderBtnText: { color: '#fff', fontSize: 16, fontWeight: '800' },
});
