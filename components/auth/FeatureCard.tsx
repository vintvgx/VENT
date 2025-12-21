import { Ionicons } from "@expo/vector-icons";
import { Dimensions, Text, View } from "react-native";

const { width } = Dimensions.get("window")
const CARD_SIZE = (width - 60) / 2;

export interface FeatureCardProps {
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
  backgroundColor: string;
  iconColor: string;
  subtitle?: string;
}

export const FeatureCard: React.FC<FeatureCardProps> = ({
  title,
  icon,
  backgroundColor,
  iconColor,
  subtitle,
}) => (
  <View
    className="rounded-3xl p-4 justify-between"
    style={{ backgroundColor, width: CARD_SIZE, height: CARD_SIZE }}>
    <View className="flex-1 justify-center items-center">
      <Ionicons name={icon} size={40} color={iconColor} />
      {subtitle && (
        <Text className="text-xs text-white/80 mt-1">{subtitle}</Text>
      )}
    </View>
    <Text
      className="text-sm font-semibold text-center"
      style={{ color: iconColor }}>
      {title}
    </Text>
  </View>
);
