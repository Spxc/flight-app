import { useCallback } from 'react';
import { fetchFlights } from '../utils/fetchFlights';

export const useFlightLoader = ({ state, dispatch, flashListRef }) => {
  const loadFlightsWithPage = useCallback(async (page: number) => {
    try {
      dispatch({ type: page > 1 ? 'SET_LOADING_MORE' : 'SET_LOADING', payload: true });

      const params: Record<string, string | number> = { page };
      if (state.selectedOrigin) params.origin = state.selectedOrigin;
      if (state.selectedDestination) params.destination = state.selectedDestination;
      if (state.drySeason) params.max_rain = 20;
      if (state.priceFilter) params.max_price = 10000;
      if (state.sortByDate) params.sort_by = 'date';
      if (state.baggageOption === 'free') {
        params.airline = 'Vietnam Airlines,Air India';
      } else if (state.baggageOption === 'included') {
        params.airline = 'VietJet Air';
      }

      const response = await fetchFlights(params);
      dispatch({ type: 'SET_TOTAL_FLIGHTS', payload: response.total_items });

      if (page === 1) {
        dispatch({ type: 'SET_FLIGHTS', payload: response.data });
      } else {
        dispatch({ type: 'APPEND_FLIGHTS', payload: response.data });
      }

      dispatch({ type: 'SET_PAGE', payload: page });
      dispatch({ type: 'SET_HAS_MORE', payload: page < response.total_pages });
    } catch (error) {
      console.error('Error loading flights:', error);
      dispatch({ type: 'SET_HAS_MORE', payload: false });
    } finally {
      dispatch({ type: 'SET_LOADING_MORE', payload: false });
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [state]);

  const resetAndReload = useCallback(async () => {
    dispatch({ type: 'RESET_LIST' });
    flashListRef?.current?.scrollToOffset({ offset: 0, animated: false });
    await loadFlightsWithPage(1);
  }, [dispatch, flashListRef, loadFlightsWithPage]);

  const loadInitialFlights = useCallback(async () => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      await loadFlightsWithPage(1);
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [dispatch, loadFlightsWithPage]);

  return {
    loadFlightsWithPage,
    resetAndReload,
    loadInitialFlights,
  };
};
