import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Text, View, ActivityIndicator } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

import { AppProvider, useApp } from './src/context/AppContext';
import HomeScreen from './src/screens/HomeScreen';
import MenuScreen from './src/screens/MenuScreen';
import DishDetailScreen from './src/screens/DishDetailScreen';
import AddScreen from './src/screens/AddScreen';
import HistoryScreen from './src/screens/HistoryScreen';
import { COLORS } from './src/theme';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

// 菜单 Stack：菜单列表 → 菜品详情
function MenuStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: COLORS.card },
        headerTintColor: COLORS.text,
        headerTitleStyle: { fontWeight: '700' },
      }}
    >
      <Stack.Screen name="MenuList" component={MenuScreen} options={{ title: '菜单' }} />
      <Stack.Screen name="DishDetail" component={DishDetailScreen} options={{ title: '菜品详情' }} />
    </Stack.Navigator>
  );
}

// 主 Tab 导航
function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          const icons = { Home: '🏠', Menu: '📋', Add: '➕', History: '📅' };
          const focusedIcons = { Home: '🏡', Menu: '📖', Add: '✏️', History: '📆' };
          const icon = focused ? focusedIcons[route.name] : icons[route.name];
          return <Text style={{ fontSize: size - 4 }}>{icon}</Text>;
        },
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.textLight,
        tabBarStyle: {
          backgroundColor: COLORS.card,
          borderTopColor: COLORS.border,
          paddingBottom: 4,
          height: 60,
        },
        tabBarLabelStyle: { fontSize: 12, fontWeight: '600' },
        headerShown: false,
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} options={{ title: '首页' }} />
      <Tab.Screen name="Menu" component={MenuStack} options={{ title: '菜单' }} />
      <Tab.Screen name="Add" component={AddScreen} options={{ title: '新增' }} />
      <Tab.Screen name="History" component={HistoryScreen} options={{ title: '历史' }} />
    </Tab.Navigator>
  );
}

// 加载态
function LoadingScreen() {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.background }}>
      <Text style={{ fontSize: 40, marginBottom: 16 }}>🍳</Text>
      <ActivityIndicator color={COLORS.primary} size="large" />
      <Text style={{ marginTop: 12, color: COLORS.textSecondary, fontSize: 14 }}>老婆厨房启动中…</Text>
    </View>
  );
}

function RootNavigator() {
  const { loaded } = useApp();
  if (!loaded) return <LoadingScreen />;
  return (
    <NavigationContainer>
      <MainTabs />
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <AppProvider>
        <StatusBar style="dark" />
        <RootNavigator />
      </AppProvider>
    </SafeAreaProvider>
  );
}
