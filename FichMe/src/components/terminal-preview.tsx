import { Text, View } from 'react-native';

import { useTerminalSettings } from '@/context/terminal-settings-context';
import { isColorDark } from '@/utils/colors';

export function TerminalPreview() {
  const { settings } = useTerminalSettings();
  const isPinButtonDark = isColorDark(settings.pinButtonColor);
  const pinTextColor = isPinButtonDark ? '#FFFFFF' : '#0F172A';

  return (
    <View className="h-24 w-full rounded-xl mb-8 items-center justify-center" style={{ backgroundColor: settings.backgroundColor }}>
      <View className="rounded-full h-16 w-16 items-center justify-center" style={{ backgroundColor: settings.pinButtonColor }}>
        <Text style={{ color: pinTextColor }}>••••</Text>
      </View>
    </View>
  );
}