import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView,
  StyleSheet, Alert, KeyboardAvoidingView, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useApp } from '../context/AppContext';
import { COLORS, DIFFICULTY_COLOR } from '../theme';

const EMOJI_PRESETS = ['🍳', '🥘', '🫕', '🍲', '🍗', '🥩', '🐟', '🦐', '🥚', '🥗', '🍜', '🍝', '🥟', '🍖', '🫑', '🍅', '🥦', '🌽', '🥕', '🧅'];
const COLOR_PRESETS = ['#E8572A', '#FF8C00', '#DC143C', '#2E8B57', '#4169E1', '#9932CC', '#B8860B', '#008B8B'];
const DIFFICULTIES = ['简单', '中等', '较难'];

// ─── 新增菜系表单 ──────────────────────────────────────────
function AddCuisineForm({ onSuccess }) {
  const { addCuisine } = useApp();
  const [name, setName] = useState('');
  const [emoji, setEmoji] = useState('🍳');
  const [color, setColor] = useState(COLOR_PRESETS[0]);

  async function handleSave() {
    if (!name.trim()) {
      Alert.alert('提示', '请输入菜系名称');
      return;
    }
    await addCuisine({ name: name.trim(), emoji, color });
    setName('');
    setEmoji('🍳');
    setColor(COLOR_PRESETS[0]);
    Alert.alert('成功', `已新增菜系「${name.trim()}」🎉`);
    onSuccess?.();
  }

  return (
    <ScrollView style={styles.formScroll} showsVerticalScrollIndicator={false}>
      <FormSection title="菜系名称">
        <TextInput
          style={styles.input}
          placeholder="例如：徽菜、西北菜…"
          placeholderTextColor={COLORS.textLight}
          value={name}
          onChangeText={setName}
          maxLength={10}
        />
      </FormSection>

      <FormSection title="图标 Emoji">
        <View style={styles.emojiGrid}>
          {EMOJI_PRESETS.map(e => (
            <TouchableOpacity
              key={e}
              style={[styles.emojiOption, emoji === e && styles.emojiOptionActive]}
              onPress={() => setEmoji(e)}
            >
              <Text style={styles.emojiOptionText}>{e}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </FormSection>

      <FormSection title="主题颜色">
        <View style={styles.colorRow}>
          {COLOR_PRESETS.map(c => (
            <TouchableOpacity
              key={c}
              style={[styles.colorDot, { backgroundColor: c }, color === c && styles.colorDotActive]}
              onPress={() => setColor(c)}
            />
          ))}
        </View>
      </FormSection>

      {/* 预览 */}
      <View style={styles.preview}>
        <View style={[styles.previewCard, { borderLeftColor: color }]}>
          <Text style={styles.previewEmoji}>{emoji}</Text>
          <Text style={styles.previewName}>{name || '菜系名称'}</Text>
        </View>
      </View>

      <SaveButton onPress={handleSave} label="添加菜系" />
    </ScrollView>
  );
}

// ─── 新增菜品表单 ──────────────────────────────────────────
function AddDishForm({ onSuccess }) {
  const { cuisines, addDish } = useApp();
  const [cuisineId, setCuisineId] = useState(cuisines[0]?.id ?? '');
  const [name, setName] = useState('');
  const [emoji, setEmoji] = useState('🍳');
  const [description, setDescription] = useState('');
  const [difficulty, setDifficulty] = useState('简单');
  const [time, setTime] = useState('');
  const [servings, setServings] = useState('');
  const [ingredients, setIngredients] = useState([{ name: '', amount: '' }]);
  const [steps, setSteps] = useState(['']);

  function updateIngredient(idx, field, value) {
    setIngredients(prev => {
      const next = [...prev];
      next[idx] = { ...next[idx], [field]: value };
      return next;
    });
  }

  function addIngredient() {
    setIngredients(prev => [...prev, { name: '', amount: '' }]);
  }

  function removeIngredient(idx) {
    if (ingredients.length === 1) return;
    setIngredients(prev => prev.filter((_, i) => i !== idx));
  }

  function updateStep(idx, value) {
    setSteps(prev => {
      const next = [...prev];
      next[idx] = value;
      return next;
    });
  }

  function addStep() {
    setSteps(prev => [...prev, '']);
  }

  function removeStep(idx) {
    if (steps.length === 1) return;
    setSteps(prev => prev.filter((_, i) => i !== idx));
  }

  async function handleSave() {
    if (!name.trim()) return Alert.alert('提示', '请输入菜品名称');
    if (!cuisineId) return Alert.alert('提示', '请选择所属菜系');
    const validIng = ingredients.filter(i => i.name.trim());
    if (validIng.length === 0) return Alert.alert('提示', '请至少添加一种配料');
    const validSteps = steps.filter(s => s.trim());
    if (validSteps.length === 0) return Alert.alert('提示', '请至少添加一个步骤');

    await addDish({
      cuisineId,
      name: name.trim(),
      emoji,
      description: description.trim(),
      difficulty,
      time: time.trim() || '未知',
      servings: servings.trim() || '2人份',
      ingredients: validIng,
      steps: validSteps,
      tags: [],
    });

    // 重置表单
    setName(''); setDescription(''); setTime(''); setServings('');
    setIngredients([{ name: '', amount: '' }]); setSteps(['']);
    Alert.alert('成功', `已新增菜品「${name.trim()}」🎉`);
    onSuccess?.();
  }

  return (
    <ScrollView
      style={styles.formScroll}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      {/* 菜系选择 */}
      <FormSection title="所属菜系">
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.chipRow}>
            {cuisines.map(c => (
              <TouchableOpacity
                key={c.id}
                style={[styles.chip, cuisineId === c.id && { backgroundColor: c.color, borderColor: c.color }]}
                onPress={() => setCuisineId(c.id)}
              >
                <Text style={[styles.chipText, cuisineId === c.id && { color: '#fff' }]}>
                  {c.emoji} {c.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </FormSection>

      {/* 基本信息 */}
      <FormSection title="菜品名称">
        <TextInput style={styles.input} placeholder="例如：红烧肉" placeholderTextColor={COLORS.textLight} value={name} onChangeText={setName} maxLength={20} />
      </FormSection>

      <FormSection title="Emoji 图标">
        <View style={styles.emojiGrid}>
          {EMOJI_PRESETS.map(e => (
            <TouchableOpacity key={e} style={[styles.emojiOption, emoji === e && styles.emojiOptionActive]} onPress={() => setEmoji(e)}>
              <Text style={styles.emojiOptionText}>{e}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </FormSection>

      <FormSection title="简介（选填）">
        <TextInput style={[styles.input, styles.textarea]} placeholder="一两句描述这道菜…" placeholderTextColor={COLORS.textLight} value={description} onChangeText={setDescription} multiline maxLength={60} />
      </FormSection>

      {/* 难度/时长/份量 */}
      <FormSection title="难度">
        <View style={styles.chipRow}>
          {DIFFICULTIES.map(d => (
            <TouchableOpacity
              key={d}
              style={[styles.chip, difficulty === d && { backgroundColor: DIFFICULTY_COLOR[d], borderColor: DIFFICULTY_COLOR[d] }]}
              onPress={() => setDifficulty(d)}
            >
              <Text style={[styles.chipText, difficulty === d && { color: '#fff' }]}>{d}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </FormSection>

      <View style={styles.row2}>
        <View style={{ flex: 1, marginRight: 8 }}>
          <FormSection title="时长">
            <TextInput style={styles.input} placeholder="如 30分钟" placeholderTextColor={COLORS.textLight} value={time} onChangeText={setTime} />
          </FormSection>
        </View>
        <View style={{ flex: 1 }}>
          <FormSection title="份量">
            <TextInput style={styles.input} placeholder="如 2-3人份" placeholderTextColor={COLORS.textLight} value={servings} onChangeText={setServings} />
          </FormSection>
        </View>
      </View>

      {/* 配料 */}
      <FormSection title="配料清单">
        {ingredients.map((ing, idx) => (
          <View key={idx} style={styles.ingRow}>
            <TextInput
              style={[styles.input, { flex: 2, marginRight: 6, marginBottom: 0 }]}
              placeholder="食材名称"
              placeholderTextColor={COLORS.textLight}
              value={ing.name}
              onChangeText={v => updateIngredient(idx, 'name', v)}
            />
            <TextInput
              style={[styles.input, { flex: 1, marginRight: 6, marginBottom: 0 }]}
              placeholder="用量"
              placeholderTextColor={COLORS.textLight}
              value={ing.amount}
              onChangeText={v => updateIngredient(idx, 'amount', v)}
            />
            <TouchableOpacity onPress={() => removeIngredient(idx)} style={styles.removeBtn}>
              <Text style={styles.removeBtnText}>✕</Text>
            </TouchableOpacity>
          </View>
        ))}
        <TouchableOpacity style={styles.addRowBtn} onPress={addIngredient}>
          <Text style={styles.addRowBtnText}>＋ 添加配料</Text>
        </TouchableOpacity>
      </FormSection>

      {/* 步骤 */}
      <FormSection title="烹饪步骤">
        {steps.map((step, idx) => (
          <View key={idx} style={styles.stepRow}>
            <View style={styles.stepNum}>
              <Text style={styles.stepNumText}>{idx + 1}</Text>
            </View>
            <TextInput
              style={[styles.input, { flex: 1, marginBottom: 0 }]}
              placeholder={`第 ${idx + 1} 步…`}
              placeholderTextColor={COLORS.textLight}
              value={step}
              onChangeText={v => updateStep(idx, v)}
              multiline
            />
            <TouchableOpacity onPress={() => removeStep(idx)} style={styles.removeBtn}>
              <Text style={styles.removeBtnText}>✕</Text>
            </TouchableOpacity>
          </View>
        ))}
        <TouchableOpacity style={styles.addRowBtn} onPress={addStep}>
          <Text style={styles.addRowBtnText}>＋ 添加步骤</Text>
        </TouchableOpacity>
      </FormSection>

      <SaveButton onPress={handleSave} label="添加菜品" />
    </ScrollView>
  );
}

// ─── 通用组件 ──────────────────────────────────────────────
function FormSection({ title, children }) {
  return (
    <View style={styles.formSection}>
      <Text style={styles.formLabel}>{title}</Text>
      {children}
    </View>
  );
}

function SaveButton({ onPress, label }) {
  return (
    <TouchableOpacity style={styles.saveBtn} onPress={onPress} activeOpacity={0.85}>
      <Text style={styles.saveBtnText}>{label}</Text>
    </TouchableOpacity>
  );
}

// ─── 主屏幕（Tab 切换） ────────────────────────────────────
const TABS = ['新增菜系', '新增菜品'];

export default function AddScreen() {
  const [activeTab, setActiveTab] = useState(0);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* 页面标题 */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>新增内容</Text>
        </View>

        {/* Tab 切换 */}
        <View style={styles.tabBar}>
          {TABS.map((tab, idx) => (
            <TouchableOpacity
              key={tab}
              style={[styles.tabItem, activeTab === idx && styles.tabItemActive]}
              onPress={() => setActiveTab(idx)}
            >
              <Text style={[styles.tabText, activeTab === idx && styles.tabTextActive]}>{tab}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* 表单内容 */}
        {activeTab === 0
          ? <AddCuisineForm onSuccess={() => {}} />
          : <AddDishForm onSuccess={() => {}} />
        }
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },

  header: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 4,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.text,
  },

  // Tab
  tabBar: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginVertical: 10,
    backgroundColor: COLORS.sidebar,
    borderRadius: 10,
    padding: 3,
  },
  tabItem: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 8,
  },
  tabItemActive: {
    backgroundColor: COLORS.card,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  tabText: { fontSize: 14, color: COLORS.textSecondary, fontWeight: '600' },
  tabTextActive: { color: COLORS.primary },

  // 表单
  formScroll: { flex: 1, paddingHorizontal: 16 },
  formSection: { marginBottom: 16 },
  formLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textSecondary,
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  input: {
    backgroundColor: COLORS.card,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: COLORS.text,
    marginBottom: 8,
  },
  textarea: { minHeight: 60, textAlignVertical: 'top' },

  // Emoji 网格
  emojiGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  emojiOption: {
    width: 44, height: 44,
    borderRadius: 10,
    backgroundColor: COLORS.card,
    borderWidth: 1, borderColor: COLORS.border,
    justifyContent: 'center', alignItems: 'center',
  },
  emojiOptionActive: {
    borderColor: COLORS.primary,
    backgroundColor: '#FFF0E8',
  },
  emojiOptionText: { fontSize: 24 },

  // 颜色选择
  colorRow: { flexDirection: 'row', gap: 10, flexWrap: 'wrap' },
  colorDot: {
    width: 32, height: 32, borderRadius: 16,
  },
  colorDotActive: {
    borderWidth: 3, borderColor: COLORS.text,
  },

  // 预览
  preview: { marginBottom: 16 },
  previewCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 14,
    borderLeftWidth: 4,
  },
  previewEmoji: { fontSize: 28, marginRight: 12 },
  previewName: { fontSize: 16, fontWeight: '700', color: COLORS.text },

  // Chip 选择
  chipRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  chip: {
    paddingHorizontal: 14, paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1, borderColor: COLORS.border,
    backgroundColor: COLORS.card,
  },
  chipText: { fontSize: 13, color: COLORS.textSecondary, fontWeight: '600' },

  // 配料行
  ingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  removeBtn: {
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: '#FFE8E8',
    justifyContent: 'center', alignItems: 'center',
  },
  removeBtnText: { fontSize: 12, color: COLORS.danger, fontWeight: '700' },
  addRowBtn: {
    borderWidth: 1.5,
    borderColor: COLORS.primary,
    borderStyle: 'dashed',
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
    marginTop: 4,
  },
  addRowBtnText: { color: COLORS.primary, fontSize: 14, fontWeight: '600' },

  // 步骤行
  stepRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  stepNum: {
    width: 26, height: 26, borderRadius: 13,
    backgroundColor: COLORS.primary,
    justifyContent: 'center', alignItems: 'center',
    marginRight: 8, marginTop: 10, flexShrink: 0,
  },
  stepNumText: { color: '#fff', fontSize: 12, fontWeight: '800' },

  // 保存按钮
  saveBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    marginVertical: 24,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  saveBtnText: { color: '#fff', fontSize: 16, fontWeight: '800' },

  // 双列输入
  row2: { flexDirection: 'row' },
});
