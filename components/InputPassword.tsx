// src/components/InputPassword.tsx
import { Ionicons } from "@expo/vector-icons"
import React, { useState } from "react"
import {
  StyleSheet,
  TextInput,
  TextInputProps,
  TouchableOpacity,
  View,
} from "react-native"

interface InputPasswordProps extends TextInputProps {
  value: string
}

const InputPassword: React.FC<InputPasswordProps> = ({
  value,
  onChangeText,
  ...props
}) => {
  const [passwordVisible, setPasswordVisible] = useState(false)

  return (
    <View style={styles.inputWrapper}>
      <TextInput
        {...props}
        value={value}
        onChangeText={onChangeText}
        secureTextEntry={!passwordVisible}
        style={styles.inputField}
      />
      <TouchableOpacity onPress={() => setPasswordVisible(!passwordVisible)}>
        <Ionicons
          name={passwordVisible ? "eye-off" : "eye"}
          size={24}
          color="#555"
        />
      </TouchableOpacity>
    </View>
  )
}

export default InputPassword

const styles = StyleSheet.create({
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    marginBottom: 20,
    paddingHorizontal: 12,
  },
  inputField: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
  },
})
