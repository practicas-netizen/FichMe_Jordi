import { Image, Pressable, Text, View } from 'react-native';

type Props = {
  companyName: string;
  logoUri: string | null;
  textColor: string;
  isDark: boolean;
  onPressSettings: () => void;
};

export function TerminalHeader({ companyName, logoUri, textColor, isDark, onPressSettings }: Props) {
  return (
    <View className="flex-row items-center justify-between">
      <View className="flex-row items-center gap-3">
        {logoUri && <Image source={{ uri: logoUri }} className="h-10 w-10 rounded-full" />}
        <Text style={{ color: textColor }} className="text-lg font-bold">
          {companyName || 'BridgeOne Terminal'}
        </Text>
      </View>

      <Pressable
        onPress={onPressSettings}
        style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]}
        className="h-11 w-11 items-center justify-center rounded-full">
        <View
          className="h-11 w-11 items-center justify-center rounded-full"
          style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.16)' : 'rgba(15,23,42,0.10)' }}>
          <Text style={{ color: textColor, fontSize: 20 }}>⚙</Text>
        </View>
      </Pressable>
    </View>
  );
}