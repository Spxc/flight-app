export const CalendarComponent = () => {
  return (
    <View style={styles.totalCountContainer}>
      <Text style={styles.totalCountText}>
        {state.totalFlights} flight{state.totalFlights !== 1 ? "s" : ""} found
      </Text>
      <TouchableOpacity
        style={[
          styles.sortButton,
          state.sortByDate && styles.sortButtonSelected,
        ]}
        onPress={handleToggleSort}
      >
        <Ionicons
          name="calendar-outline"
          size={16}
          color={
            state.sortByDate
              ? isDarkMode
                ? "#00cc00"
                : "#00a000"
              : isDarkMode
              ? "#aaa"
              : "#555"
          }
        />
        <Text
          style={[
            styles.sortButtonText,
            state.sortByDate && styles.sortButtonTextSelected,
          ]}
        >
          {state.sortByDate ? "Sorted by Date" : "Sort by Date"}
        </Text>
      </TouchableOpacity>
    </View>
  );
};
