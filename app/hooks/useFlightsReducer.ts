import { useReducer } from 'react';
import { flightListReducer, initialState } from '../reducers/flightListReducer';

export const useFlightsReducer = () => {
  const [state, dispatch] = useReducer(flightListReducer, initialState);
  return { state, dispatch };
};
