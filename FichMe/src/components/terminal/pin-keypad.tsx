import { Pressable, Text, View } from 'react-native';

const DIGITS = ['1', '2', '3', '4', '5', '6', '7', '8', '9'];

type Props = {
  disabled: boolean;
  pinButtonColor: string;
  pinTextColor: string;
  backspaceColor: string;
  textColor: string;
  onDigit: (digit: string) => void;
  onBackspace: () => void;
};

export function PinKeypad({ disabled, pinButtonColor, pinTextColor, backspaceColor, textColor, onDigit, onBackspace }: Props) {
  return (
    <View className="w-64 flex-row flex-wrap justify-center gap-4">
      {DIGITS.map((digit) => (
        <Pressable key={digit} onPress={() => onDigit(digit)} style={({ pressed }) => ({ opacity: pressed || disabled ? 0.7 : 1 })}>
          <View className="h-16 w-16 items-center justify-center rounded-full" style={{ backgroundColor: pinButtonColor }}>
            <Text style={{ color: pinTextColor, fontSize: 24, fontWeight: '700' }}>{digit}</Text>
          </View>
        </Pressable>
      ))}

      <View className="h-16 w-16" />

      <Pressable onPress={() => onDigit('0')} style={({ pressed }) => ({ opacity: pressed || disabled ? 0.7 : 1 })}>
        <View className="h-16 w-16 items-center justify-center rounded-full" style={{ backgroundColor: pinButtonColor }}>
          <Text style={{ color: pinTextColor, fontSize: 24, fontWeight: '700' }}>0</Text>
        </View>
      </Pressable>

      <Pressable
        onPress={onBackspace}
        className="h-16 w-16 items-center justify-center rounded-full"
        style={({ pressed }) => ({ backgroundColor: backspaceColor, opacity: pressed ? 0.7 : 1 })}>
        <Text style={{ color: textColor }} className="text-lg">⌫</Text>
      </Pressable>
    </View>
  );
}