import { useEffect, useRef, useState } from 'react';
import { PanResponder, Pressable, Text, View } from 'react-native';

import { hexToHsv, hsvToHex, isColorDark } from '@/utils/colors';

const SEGMENTS = 40;
const THUMB = 24;

type SliderProps = {
  value: number; // 0 a 1
  colorAt: (p: number) => string; // color de la barra en cada punto
  onChange: (p: number) => void;
};

function GradientSlider({ value, colorAt, onChange }: SliderProps) {
  const [width, setWidth] = useState(0);
  const widthRef = useRef(0);
  const startRef = useRef(0);
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  const clamp = (n: number) => Math.min(1, Math.max(0, n));

  const responder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderTerminationRequest: () => false,
      onPanResponderGrant: (e) => {
        const p = clamp(e.nativeEvent.locationX / (widthRef.current || 1));
        startRef.current = p;
        onChangeRef.current(p);
      },
      onPanResponderMove: (_, g) => {
        onChangeRef.current(clamp(startRef.current + g.dx / (widthRef.current || 1)));
      },
    })
  ).current;

  return (
    <View style={{ paddingHorizontal: THUMB / 2 }}>
      <View
        {...responder.panHandlers}
        onLayout={(e) => {
          widthRef.current = e.nativeEvent.layout.width;
          setWidth(e.nativeEvent.layout.width);
        }}
        style={{ height: THUMB, justifyContent: 'center' }}>
        {/* Barra de colores hecha con tramos */}
        <View
          pointerEvents="none"
          style={{ flexDirection: 'row', height: THUMB, borderRadius: THUMB / 2, overflow: 'hidden' }}>
          {Array.from({ length: SEGMENTS }).map((_, i) => (
            <View key={i} style={{ flex: 1, backgroundColor: colorAt(i / (SEGMENTS - 1)) }} />
          ))}
        </View>

        {/* Círculo que se arrastra */}
        <View
          pointerEvents="none"
          style={{
            position: 'absolute',
            left: value * width - THUMB / 2,
            width: THUMB,
            height: THUMB,
            borderRadius: THUMB / 2,
            borderWidth: 3,
            borderColor: '#FFFFFF',
            backgroundColor: 'transparent',
            shadowColor: '#000',
            shadowOpacity: 0.3,
            shadowRadius: 3,
            shadowOffset: { width: 0, height: 1 },
            elevation: 4,
          }}
        />
      </View>
    </View>
  );
}

type Props = {
  colors: string[]; // colores predefinidos (atajos)
  value: string; // color actual "#RRGGBB"
  onChange: (hex: string) => void;
  selectedBorderColor?: string;
  size?: number;
};

export function ColorField({ colors, value, onChange, selectedBorderColor = '#2563EB', size = 48 }: Props) {
  const [open, setOpen] = useState(false);
  const [hsv, setHsv] = useState(() => hexToHsv(value));

  // Si el color cambia desde fuera (por ejemplo, al tocar un atajo), sincroniza las barras
  useEffect(() => {
    if (hsvToHex(hsv.h, hsv.s, hsv.v) !== value.toUpperCase()) {
      setHsv(hexToHsv(value));
    }
  }, [value]);

  const isPreset = colors.some((c) => c.toLowerCase() === value.toLowerCase());

  function update(partial: Partial<typeof hsv>) {
    const next = { ...hsv, ...partial };
    setHsv(next);
    onChange(hsvToHex(next.h, next.s, next.v));
  }

  return (
    <View>
      <View className="mb-4 flex-row flex-wrap gap-3">
        {colors.map((color) => {
          const selected = value.toLowerCase() === color.toLowerCase();
          return (
            <Pressable
              key={color}
              onPress={() => onChange(color)}
              style={{
                width: size,
                height: size,
                borderRadius: size / 2,
                borderWidth: 2,
                borderColor: selected ? selectedBorderColor : 'transparent',
                backgroundColor: color,
                alignItems: 'center',
                justifyContent: 'center',
              }}>
              {selected && <Text style={{ color: isColorDark(color) ? '#FFFFFF' : '#0F172A' }}>✓</Text>}
            </Pressable>
          );
        })}

        {/* Botón del color libre: si hay un color personalizado, se muestra con ese color */}
        <Pressable
          onPress={() => setOpen((o) => !o)}
          style={{
            width: size,
            height: size,
            borderRadius: size / 2,
            borderWidth: 2,
            borderStyle: isPreset ? 'dashed' : 'solid',
            borderColor: isPreset ? '#94A3B8' : selectedBorderColor,
            backgroundColor: isPreset ? 'transparent' : value,
            alignItems: 'center',
            justifyContent: 'center',
          }}>
          <Text style={{ fontSize: 22, color: isPreset ? '#64748B' : isColorDark(value) ? '#FFFFFF' : '#0F172A' }}>
            {open ? '–' : '+'}
          </Text>
        </Pressable>
      </View>

      {open && (
        <View>
          <View style={{ marginBottom: 12 }}>
            <GradientSlider
              value={hsv.h / 360}
              colorAt={(p) => hsvToHex(p * 360, 1, 1)}
              onChange={(p) => update({ h: p * 360 })}
            />
          </View>
          <View style={{ marginBottom: 12 }}>
            <GradientSlider
              value={hsv.s}
              colorAt={(p) => hsvToHex(hsv.h, p, hsv.v)}
              onChange={(p) => update({ s: p })}
            />
          </View>
          <View style={{ marginBottom: 12 }}>
            <GradientSlider
              value={hsv.v}
              colorAt={(p) => hsvToHex(hsv.h, hsv.s, p)}
              onChange={(p) => update({ v: p })}
            />
          </View>
          <Text className="text-center text-sm text-slate-600 dark:text-slate-300">{value.toUpperCase()}</Text>
        </View>
      )}
    </View>
  );
}