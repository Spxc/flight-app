import React, { useEffect, useCallback, useRef } from "react";
import {
  View,
  Text,
  ActivityIndicator,
  StyleSheet,
  TouchableOpacity,
  useColorScheme,
} from "react-native";
import { routes } from "../../utils/routes";
import FlightCard from "../../../components/FlightCard";
import FilterTabs from "../../../components/FilterTabs";
import TripBottomSheet from "../../../components/TripBottomSheet";
import LuggagePolicyBottomSheet from "../../../components/LuggagePolicyModal";
import RainInfoBottomSheet from "../../../components/RainInfoBottomSheet";

import { useFlightListScreen } from "./useFlightListScreen";
import { CalendarComponent } from "./components/CalendarComponent";

const FlightListScreen = () => {
  const {
    models: { state, price, duration, luggagePolicies, uniqueCities },
    operations: {
      loadInitialFlights,
      resetAndReload,
      handleEndReached,
      handleSelectFlight,
      handleRemoveFlight,
      handleOpenLuggagePolicy,
      handleCloseLuggagePolicy,
      getLuggageData,
      handleOpenRainInfo,
      handleCloseRainInfo,
      handleToggleSort,
    },
  } = useFlightListScreen();

  // Get device color scheme
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === "dark";

  // Load initial flights
  useEffect(() => {
    loadInitialFlights();
  }, []);

  // Reset and reload flights when filters change
  useEffect(() => {
    if (!state.loading) {
      resetAndReload();
    }
  }, [
    state.selectedOrigin,
    state.selectedDestination,
    state.baggageOption,
    state.drySeason,
    state.priceFilter,
    state.sortByDate,
  ]);

  const renderItem = useCallback(
    ({ item }: { item: Flight }) => (
      <FlightCard
        item={item}
        baggageOption={state.baggageOption}
        standardBaggageWeight={state.standardBaggageWeight}
        onSelectFlight={handleSelectFlight}
        onLuggagePolicyPress={handleOpenLuggagePolicy}
        onRainInfoPress={handleOpenRainInfo}
        luggagePolicies={luggagePolicies}
      />
    ),
    [
      state.baggageOption,
      state.standardBaggageWeight,
      handleSelectFlight,
      handleOpenLuggagePolicy,
      handleOpenRainInfo,
    ]
  );

  // Theme-based styles
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: isDarkMode ? "#1a1a1a" : "#f8f9fa",
    },
    loadingContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: isDarkMode ? "#1a1a1a" : "#f8f9fa",
    },
    listContentStyle: {
      padding: 12,
      paddingBottom: 150,
    },
    emptyListContentStyle: {
      flexGrow: 1,
      justifyContent: "center",
      alignItems: "center",
      padding: 12,
    },
    footerLoader: {
      flexDirection: "row",
      justifyContent: "center",
      alignItems: "center",
      paddingVertical: 20,
    },
    footerText: {
      marginLeft: 8,
      color: isDarkMode ? "#999" : "#666",
      fontSize: 14,
    },
    emptyContainer: {
      alignItems: "center",
      justifyContent: "center",
      padding: 24,
      marginTop: 50,
    },
    emptyText: {
      fontSize: 18,
      fontWeight: "bold",
      color: isDarkMode ? "#ccc" : "#666",
      marginBottom: 8,
    },
    emptySubtext: {
      fontSize: 14,
      color: isDarkMode ? "#777" : "#999",
      textAlign: "center",
    },
    totalCountContainer: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingHorizontal: 12,
      paddingVertical: 8,
      backgroundColor: isDarkMode ? "#2a2a2a" : "#fff",
      borderBottomWidth: 1,
      borderBottomColor: isDarkMode ? "#333" : "#eee",
    },
    totalCountText: {
      fontSize: 14,
      color: isDarkMode ? "#ddd" : "#333",
      fontWeight: "500",
    },
    sortButton: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 20,
      backgroundColor: isDarkMode ? "#333" : "#f0f0f0",
      borderWidth: 1,
      borderColor: isDarkMode ? "#444" : "#e0e0e0",
    },
    sortButtonSelected: {
      backgroundColor: isDarkMode ? "#2a4d2a" : "#e6f7e6",
      borderColor: isDarkMode ? "#3a6d3a" : "#b3e6b3",
    },
    sortButtonText: {
      marginLeft: 4,
      color: isDarkMode ? "#aaa" : "#555",
      fontSize: 12,
      fontWeight: "500",
    },
    sortButtonTextSelected: {
      color: isDarkMode ? "#00cc00" : "#00a000",
      fontWeight: "600",
    },
  });

  const renderFooter = () =>
    state.loadingMore ? (
      <View style={styles.footerLoader}>
        <ActivityIndicator
          size="small"
          color={isDarkMode ? "#3399ff" : "#0066cc"}
        />
        <Text style={styles.footerText}>Loading more flights...</Text>
      </View>
    ) : !state.hasMore && state.flights.length > 0 ? (
      <View style={styles.footerLoader}>
        <Text style={styles.footerText}>End of list</Text>
      </View>
    ) : null;

  const renderEmptyList = () =>
    state.loading && state.page === 1 ? null : (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No flights found</Text>
        <Text style={styles.emptySubtext}>Try adjusting your filters</Text>
      </View>
    );

  if (state.loading && state.page === 1) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator
          size="large"
          color={isDarkMode ? "#3399ff" : "#0066cc"}
        />
        <Text style={{ color: isDarkMode ? "#ddd" : "#333" }}>
          Loading flights...
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FilterTabs
        uniqueCities={uniqueCities}
        selectedOrigin={state.selectedOrigin}
        selectedDestination={state.selectedDestination}
        baggageOption={state.baggageOption}
        standardBaggageWeight={state.standardBaggageWeight}
        drySeason={state.drySeason}
        priceFilter={state.priceFilter}
        routes={routes}
        onOriginSelect={(origin) =>
          dispatch({ type: "SET_ORIGIN", payload: origin })
        }
        onDestinationSelect={(destination) =>
          dispatch({ type: "SET_DESTINATION", payload: destination })
        }
        onBaggageOptionChange={(option) =>
          dispatch({ type: "SET_BAGGAGE_OPTION", payload: option })
        }
        onBaggageWeightChange={(weight) =>
          dispatch({ type: "SET_BAGGAGE_WEIGHT", payload: weight })
        }
        onDrySeasonToggle={(value) =>
          dispatch({ type: "SET_DRY_SEASON", payload: value })
        }
        onPriceFilterToggle={(value) =>
          dispatch({ type: "SET_PRICE_FILTER", payload: value })
        }
      />
      <CalendarComponent />
      <FlashList
        ref={flashListRef}
        data={state.flights}
        keyExtractor={(item) => item.uuid}
        renderItem={renderItem}
        onEndReached={handleEndReached}
        onEndReachedThreshold={0.5}
        ListFooterComponent={renderFooter}
        ListEmptyComponent={renderEmptyList}
        contentContainerStyle={
          state.flights.length === 0
            ? styles.emptyListContentStyle
            : styles.listContentStyle
        }
        estimatedItemSize={220}
        extraData={{
          baggageOption: state.baggageOption,
          standardBaggageWeight: state.standardBaggageWeight,
        }}
      />

      {(state.trip.outbound || state.trip.return) && (
        <TripBottomSheet
          outboundFlight={state.trip.outbound}
          returnFlight={state.trip.return}
          price={price}
          duration={duration}
          onRemoveFlight={handleRemoveFlight}
        />
      )}

      {state.luggagePolicyVisible && (
        <LuggagePolicyBottomSheet
          visible={state.luggagePolicyVisible}
          onClose={handleCloseLuggagePolicy}
          airline={state.selectedAirline}
          luggagePolicy={getLuggageData()}
        />
      )}

      {state.selectedFlightForRainInfo && (
        <RainInfoBottomSheet
          visible={state.rainInfoVisible}
          onClose={handleCloseRainInfo}
          destination={state.selectedFlightForRainInfo.destination}
          date={state.selectedFlightForRainInfo.date}
          rain_probability={state.selectedFlightForRainInfo.rain_probability}
        />
      )}
    </View>
  );
};

export default FlightListScreen;
