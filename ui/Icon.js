import { Ionicons } from "@expo/vector-icons";
import { View } from "react-native";


function Icon({ name, size, color }) {
  return <View>
    <Ionicons name={name} size={size} color={color} />
  </View>;
}

export default Icon;