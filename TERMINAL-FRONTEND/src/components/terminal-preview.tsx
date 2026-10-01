import { Text, View } from 'react-native';
import { isColorDark } from '@/utils/colors';

type Props = {
  backgroundColor: string;
  pinButtonColor: string;
  // Versión más baja y con menos margen, para cuando la vista previa va fija en pantalla
  compact?: boolean;
};

export function TerminalPreview({ backgroundColor, pinButtonColor, compact = false }: Props) {
  const pinTextColor = isColorDark(pinButtonColor) ? '#FFFFFF' : '#0F172A';

  return (
    <View
      className={`w-full rounded-xl items-center justify-center ${compact ? 'h-20 mb-2' : 'h-24 mb-8'}`}
      style={{ backgroundColor }}>
      <View className="rounded-full h-14 w-14 items-center justify-center" style={{ backgroundColor: pinButtonColor }}>
        <Text style={{ color: pinTextColor }}>••••</Text>
      </View>
    </View>
  );
}