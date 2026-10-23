import { ClockResult } from "@/api/api";
import { useTerminalSettings } from "@/context/terminal-settings-context";
import { useI18n } from "@/i18n/i18n-context";
import { isColorDark } from "@/utils/colors";
import { useEffect } from "react";
import { Pressable, View, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";


type Props = {
    result: ClockResult;
    onDone: () => void;
};

const AUTO_RETURN_MS = 5_000;

export function ClockConfirmationScreen({ result, onDone }: Props) {
    const { settings } = useTerminalSettings();
    const { t, locale } = useI18n();

    useEffect(() => {
        const timeoutId = setTimeout(onDone, AUTO_RETURN_MS);
        return () => clearTimeout(timeoutId);
    }, [onDone]);

    const isDark = isColorDark(settings.backgroundColor);
    const textColor = isDark ? '#FFFFFF' : '#0F172A';
    const mutedColor = isDark ? 'rgba(255,255,255,0.7)' : 'rgba(15,23,42,0.65)';
    const action = result.type === 'in' ? t('terminal.checkedIn') : t('terminal.checkedOut');

    const clockedAt = new Date(result.clockedAt);
    const time = clockedAt.toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' });
    const date = clockedAt.toLocaleDateString(locale, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

    return (
        <View className="flex-1" style={{ backgroundColor: settings.backgroundColor }}>
            <SafeAreaView className="flex-1 items-center justify-center px-6 py-8">
                <Text accessibilityLabel={t('terminal.confirmationTitle')} className="mb-5 text-7xl font-bold text-green-500" >
                    ✓
                </Text>

                <Text className="mb-3 text-center text-3xl font-bold" style={{ color: textColor }}>
                    {t('terminal.confirmationTitle')}
                </Text>

                <Text className="mt-5 text-center text-2xl font-semibold" style={{ color: textColor }}>
                    {result.name}
                </Text>

                <Text className="mt-3 text-center text-xl" style={{ color: textColor }}>
                    {action}
                </Text>

                <Text className="mt-5 text-5xl font-bold" style={{ color: textColor }}>
                    {time}
                </Text>

                <Text className="mt-2 text-center text-base" style={{ color: mutedColor }}>
                    {date}
                </Text>

                <Text className="mt-8 text-center text-sm" style={{ color: mutedColor }}>
                    {t('terminal.confirmationAutoReturn')}
                </Text>

            </SafeAreaView>
        </View>
    )
}