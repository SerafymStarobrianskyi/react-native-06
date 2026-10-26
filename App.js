import { useState } from "react";
import { StatusBar } from "expo-status-bar";
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Picker } from "@react-native-picker/picker";
import { Controller, useForm } from "react-hook-form";
import { sendData } from "./services/sendData";

const EMAIL_PATTERN = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

const isLaterDate = (checkOutDate, checkInDate) => {
  if (!checkOutDate) return true;
  return (
    new Date(checkOutDate).setHours(0, 0, 0, 0) >
    new Date(checkInDate).setHours(0, 0, 0, 0)
  );
};

export default function App() {
  const [openDateField, setOpenDateField] = useState(null);
  const {
    control,
    handleSubmit,
    setValue,
    getValues,
    trigger,
    formState: { errors },
  } = useForm({
    defaultValues: {
      userName: "",
      email: "",
      roomType: "standard",
      checkInDate: new Date(),
      checkOutDate: null,
    },
  });

  const onDateChange = (event, selectedDate) => {
    const field = openDateField;
    setOpenDateField(null);
    if (event?.type === "dismissed") return;

    const date = selectedDate || event?.nativeEvent?.timestamp;
    if (!field || !date) return;

    const nextDate = date instanceof Date ? date : new Date(date);
    if (Number.isNaN(nextDate.getTime())) return;

    setValue(field, nextDate, { shouldValidate: true });
    // The check-out rule depends on both dates, so changing either date reruns it.
    trigger("checkOutDate");
  };

  return (
    <View style={styles.container}>
      <View>
        <Text style={styles.formHeader}>Booking form</Text>

        <Text style={styles.formTitle}>Name</Text>
        <Controller
          control={control}
          name="userName"
          rules={{
            required: "Name is required",
            pattern: {
              value: /^[A-Z].{2,}$/,
              message:
                "Name must start with a capital letter and contain at least 3 characters",
            },
          }}
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              testID="user-name-input"
              style={styles.input}
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
            />
          )}
        />
        {errors.userName && <Text style={styles.errorText}>{errors.userName.message}</Text>}

        <Text style={styles.formTitle}>email</Text>
        <Controller
          control={control}
          name="email"
          rules={{
            required: "e-mail is required",
            pattern: {
              value: EMAIL_PATTERN,
              message: "Invalid email address. Please enter a valid email",
            },
          }}
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              testID="email-input"
              style={styles.input}
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          )}
        />
        {errors.email && <Text style={styles.errorText}>{errors.email.message}</Text>}

        <Text style={styles.formTitle}>Check-In Date</Text>
        <Controller
          control={control}
          name="checkInDate"
          rules={{ required: true }}
          render={({ field: { value } }) => (
            <TouchableOpacity style={styles.input} onPress={() => setOpenDateField("checkInDate")}>
              <Text>{value.toLocaleDateString()}</Text>
            </TouchableOpacity>
          )}
        />

        <Text style={styles.formTitle}>Check-Out Date</Text>
        <Controller
          control={control}
          name="checkOutDate"
          rules={{
            required: "Check-Out Date is required",
            validate: (value) =>
              isLaterDate(value, getValues("checkInDate")) ||
              "The Check-Out Date must be later than the Check-In Date",
          }}
          render={({ field: { value } }) => (
            <TouchableOpacity style={styles.input} onPress={() => setOpenDateField("checkOutDate")}>
              <Text>{value ? value.toLocaleDateString() : "Select Date"}</Text>
            </TouchableOpacity>
          )}
        />
        {errors.checkOutDate && (
          <Text style={styles.errorText}>{errors.checkOutDate.message}</Text>
        )}

        {openDateField && (
          <DateTimePicker
            testID="date-time-picker"
            value={getValues(openDateField) || new Date()}
            mode="date"
            onChange={onDateChange}
          />
        )}

        <Text style={styles.formTitle}>Choose the room type:</Text>
        <Controller
          control={control}
          name="roomType"
          rules={{ required: true }}
          render={({ field: { onChange, value } }) => (
            <Picker selectedValue={value} onValueChange={onChange}>
              <Picker.Item label="Standard" value="standard" />
              <Picker.Item label="Luxury" value="luxury" />
              <Picker.Item label="Family" value="family" />
            </Picker>
          )}
        />

        <TouchableOpacity
          style={{ ...styles.button, marginTop: 50 }}
          onPress={handleSubmit((data) => sendData(data))}
        >
          <Text style={styles.buttonText}>Submit</Text>
        </TouchableOpacity>
      </View>
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 20,
    backgroundColor: "#ffffff",
    alignSelf: "center",
    width: "100%",
    maxWidth: 600,
  },
  button: {
    backgroundColor: "#0056b3",
    padding: 10,
    borderRadius: 8,
    alignItems: "center",
    elevation: 4,
  },
  buttonText: {
    color: "white",
    fontSize: 16,
  },
  formHeader: {
    fontSize: 20,
    textAlign: "center",
    fontWeight: "bold",
    color: "#0056b3",
    marginBottom: 20,
    marginTop: 20,
  },
  formTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#0056b3",
    marginBottom: 10,
    marginTop: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: "#cccccc",
    padding: 10,
    borderRadius: 4,
  },
  errorText: {
    color: "red",
  },
});
