import { Animated, View } from 'react-native';

type Props = {
  length: number;
  filledCount: number;
  feedback: 'idle' | 'success' | 'error';
  pinButtonColor: string;
  mutedColor: string;
  shake: Animated.Value;
};

export function PinDots({ length, filledCount, feedback, pinButtonColor, mutedColor, shake }: Props) {
  return (
    <Animated.View className="mb-8 flex-row gap-3" style={{ transform: [{ translateX: shake }] }}>
      {Array.from({ length }).map((_, i) => (
        <View
          key={i}
          className="h-3 w-3 rounded-full"
          style={{
            backgroundColor:
              feedback === 'error' ? '#DC2626' : feedback === 'success' ? '#46e607' : i < filledCount ? pinButtonColor : mutedColor,
          }}
        />
      ))}
    </Animated.View>
  );
}