import { Pressable, Text } from 'react-native';
import { useColorScheme } from 'nativewind';

export function ThemeToggle() {
  const { colorScheme, setColorScheme } = useColorScheme();

  function toggle() {
    setColorScheme(colorScheme === 'dark' ? 'light' : 'dark');
  }

  return (
    <Pressable onPress={toggle} style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]}>
      <Text className="text-2xl">{colorScheme === 'dark' ? '☀️' : '🌙'}</Text>
    </Pressable>
  );
}