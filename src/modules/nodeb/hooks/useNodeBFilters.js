import { useReducer, useMemo, useCallback } from 'react';

const initialState = {
  singleSelect: {
    district: null,
    statusLapangan: null,
    progresLapangan: null,
    batchOrder: null,
    subkon: null,
  },
  multiSelect: {
    district: new Set(),
    statusLapangan: new Set(),
  },
  localToggles: {
    batchGroupBy: 'batchOrder',
  }
};

function filterReducer(state, action) {
  switch (action.type) {
    case 'TOGGLE_SINGLE_SELECT': {
      const { key, value } = action.payload;
      const current = state.singleSelect[key];
      return {
        ...state,
        singleSelect: {
          ...state.singleSelect,
          [key]: current === value ? null : value,
        }
      };
    }
    case 'SET_MULTI_SELECT': {
      const { key, values } = action.payload; // Set object or array
      return {
        ...state,
        multiSelect: {
          ...state.multiSelect,
          [key]: new Set(values),
        }
      };
    }
    case 'TOGGLE_MULTI_SELECT_ITEM': {
      const { key, value } = action.payload;
      const currentSet = new Set(state.multiSelect[key] || []);
      if (currentSet.has(value)) {
        currentSet.delete(value);
      } else {
        currentSet.add(value);
      }
      return {
        ...state,
        multiSelect: {
          ...state.multiSelect,
          [key]: currentSet,
        }
      };
    }
    case 'SET_LOCAL_TOGGLE': {
      const { key, value } = action.payload;
      return {
        ...state,
        localToggles: {
          ...state.localToggles,
          [key]: value,
        }
      };
    }
    case 'RESET_FILTERS':
      return initialState;
    default:
      return state;
  }
}

export function useNodeBFilters(rawRows = []) {
  const [state, dispatch] = useReducer(filterReducer, initialState);

  const filteredRows = useMemo(() => {
    if (!rawRows || rawRows.length === 0) return [];

    return rawRows.filter(row => {
      // Single-select filters (AND logic)
      if (state.singleSelect.district && row.district !== state.singleSelect.district) {
        return false;
      }
      if (state.singleSelect.statusLapangan && row.statusLapangan !== state.singleSelect.statusLapangan) {
        return false;
      }
      if (state.singleSelect.progresLapangan && row.progresLapangan !== state.singleSelect.progresLapangan) {
        return false;
      }
      if (state.singleSelect.batchOrder && row.batchOrder !== state.singleSelect.batchOrder) {
        return false;
      }
      if (state.singleSelect.subkon && row.subkon !== state.singleSelect.subkon) {
        return false;
      }

      // Multi-select filters (AND logic, item inside set is OR)
      if (state.multiSelect.district.size > 0 && !state.multiSelect.district.has(row.district)) {
        return false;
      }
      if (state.multiSelect.statusLapangan.size > 0 && !state.multiSelect.statusLapangan.has(row.statusLapangan)) {
        return false;
      }

      return true;
    });
  }, [rawRows, state.singleSelect, state.multiSelect]);

  const toggleSingleSelect = useCallback((key, value) => {
    dispatch({ type: 'TOGGLE_SINGLE_SELECT', payload: { key, value } });
  }, []);

  const setMultiSelect = useCallback((key, values) => {
    dispatch({ type: 'SET_MULTI_SELECT', payload: { key, values } });
  }, []);

  const toggleMultiSelectItem = useCallback((key, value) => {
    dispatch({ type: 'TOGGLE_MULTI_SELECT_ITEM', payload: { key, value } });
  }, []);

  const resetFilters = useCallback(() => {
    dispatch({ type: 'RESET_FILTERS' });
  }, []);

  const isFiltered = useMemo(() => {
    const hasSingle = Object.values(state.singleSelect).some(v => v !== null);
    const hasMulti = Object.values(state.multiSelect).some(s => s.size > 0);
    return hasSingle || hasMulti;
  }, [state.singleSelect, state.multiSelect]);

  return {
    state,
    filteredRows,
    toggleSingleSelect,
    setMultiSelect,
    toggleMultiSelectItem,
    resetFilters,
    isFiltered,
  };
}
