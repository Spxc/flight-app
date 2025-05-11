import React, {
  useEffect,
  useReducer,
  useCallback,
  useMemo,
  useRef,
} from "react";
import { fetchFlights } from "../../utils/fetchFlights";
import { routes } from "../../utils/routes";
import { parseISO, differenceInCalendarDays } from "date-fns";
import {
  flightListReducer,
  initialState,
  luggagePolicies,
  Flight,
} from "../../reducers/flightListReducer";
import { FlashList } from "@shopify/flash-list";

export const useFlightListScreen = () => {
  const flashListRef = useRef<FlashList<Flight>>(null);
  const [state, dispatch] = useReducer(flightListReducer, initialState);
  // Calculate trip price and duration
  const { price, duration } = useMemo(() => {
    const outbound = state.trip.outbound;
    const returnFlight = state.trip.return;

    const outboundPrice = outbound?.price_inr || 0;
    const returnPrice = returnFlight?.price_inr || 0;
    const total = outboundPrice + returnPrice;

    let duration: number | null = null;
    if (outbound?.date && returnFlight?.date) {
      const startDate = parseISO(outbound.date);
      const endDate = parseISO(returnFlight.date);
      duration = differenceInCalendarDays(endDate, startDate);
    }

    return { price: total, duration };
  }, [state.trip.outbound, state.trip.return]);

  const loadInitialFlights = async () => {
    try {
      dispatch({ type: "SET_LOADING", payload: true });
      await loadFlightsWithPage(1);
    } catch (error) {
      console.error("Error loading initial flights:", error);
    } finally {
      dispatch({ type: "SET_LOADING", payload: false });
    }
  };

  const resetAndReload = async () => {
    dispatch({ type: "RESET_LIST" });
    if (flashListRef.current) {
      flashListRef.current.scrollToOffset({ offset: 0, animated: false });
    }
    await loadFlightsWithPage(1);
  };

  const loadFlightsWithPage = useCallback(
    async (page: number) => {
      try {
        if (page > 1) {
          dispatch({ type: "SET_LOADING_MORE", payload: true });
        } else {
          dispatch({ type: "SET_LOADING", payload: true });
        }

        const params: Record<string, string | number> = { page };
        if (state.selectedOrigin) params.origin = state.selectedOrigin;
        if (state.selectedDestination)
          params.destination = state.selectedDestination;
        if (state.drySeason) params.max_rain = 20;
        if (state.priceFilter) params.max_price = 10000;
        if (state.sortByDate) params.sort_by = "date";
        if (state.baggageOption === "free") {
          params.airline = "Vietnam Airlines,Air India";
        } else if (state.baggageOption === "included") {
          params.airline = "VietJet Air";
        }

        const response = await fetchFlights(params);

        const totalCount = response.total_items;
        dispatch({ type: "SET_TOTAL_FLIGHTS", payload: totalCount });

        const flights = response.data;
        if (flights.length === 0) {
          dispatch({ type: "SET_HAS_MORE", payload: false });
          dispatch({ type: "SET_LOADING_MORE", payload: false });
          if (page === 1) dispatch({ type: "SET_FLIGHTS", payload: [] });
          return;
        }

        if (page === 1) {
          dispatch({ type: "SET_FLIGHTS", payload: flights });
        } else {
          dispatch({ type: "APPEND_FLIGHTS", payload: flights });
        }

        dispatch({ type: "SET_PAGE", payload: page });
        dispatch({
          type: "SET_HAS_MORE",
          payload: page < response.total_pages,
        });
      } catch (error) {
        console.error("Error loading flights:", error);
        dispatch({ type: "SET_HAS_MORE", payload: false });
      } finally {
        dispatch({ type: "SET_LOADING_MORE", payload: false });
        dispatch({ type: "SET_LOADING", payload: false });
      }
    },
    [
      state.selectedOrigin,
      state.selectedDestination,
      state.baggageOption,
      state.drySeason,
      state.priceFilter,
      state.sortByDate,
    ]
  );

  const handleEndReached = useCallback(() => {
    if (!state.loadingMore && state.hasMore && !state.loading) {
      loadFlightsWithPage(state.page + 1);
    }
  }, [state.loadingMore, state.hasMore, state.page, state.loading]);

  const handleSelectFlight = useCallback(
    (flight: Flight, direction: "Outbound" | "Return") => {
      dispatch({
        type: "SELECT_FLIGHT",
        payload: { flight, direction },
      });
    },
    []
  );

  const handleRemoveFlight = useCallback((direction: "Outbound" | "Return") => {
    dispatch({ type: "REMOVE_FLIGHT", payload: direction });
  }, []);

  const handleOpenLuggagePolicy = useCallback((airline: string) => {
    if (luggagePolicies[airline]) {
      dispatch({ type: "OPEN_LUGGAGE_POLICY", payload: airline });
    } else {
      console.warn(`Luggage policy not found for airline: ${airline}`);
    }
  }, []);

  const handleCloseLuggagePolicy = useCallback(() => {
    dispatch({ type: "CLOSE_LUGGAGE_POLICY" });
  }, []);

  const getLuggageData = useCallback(() => {
    return luggagePolicies[state.selectedAirline] || null;
  }, [state.selectedAirline]);

  const handleOpenRainInfo = useCallback((flight: Flight) => {
    dispatch({ type: "OPEN_RAIN_INFO", payload: flight });
  }, []);

  const handleCloseRainInfo = useCallback(() => {
    dispatch({ type: "CLOSE_RAIN_INFO" });
  }, []);

  const handleToggleSort = useCallback(() => {
    dispatch({ type: "TOGGLE_SORT_BY_DATE" });
  }, []);

  const getUniqueCities = useMemo(() => {
    const origins = [...new Set(routes.map((route) => route.origin))];
    return origins.sort();
  }, []);

  return {
    models: {
      state,
      flashListRef: useRef(null),
      price,
      duration,
      luggagePolicies,
      uniqueCities: getUniqueCities(),
    },
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
  };
};
