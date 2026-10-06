import { useReducer, useMemo, useCallback } from 'react';

const initialState = {
  singleSelect: {
    district: null,
    statusProgres: null,
    klasifikasiLop: null,
    subconTa: null,
    batch: null,
    closedOnly: null,
    hasRealisasi: null,
    progressLapangan: null,
    subStatus: null,
    selectedRegion: null,
  },
  multiSelect: {
    district: new Set(),
    statusProgres: new Set(),
  },
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
    case 'SET_CELL_FILTER': {
      const { type, name, reg } = action.payload;
      const progKey = type === 'progress' ? 'progressLapangan' : 'subStatus';
      const otherKey = type === 'progress' ? 'subStatus' : 'progressLapangan';

      const currentProg = state.singleSelect[progKey];
      const currentReg = state.singleSelect.selectedRegion;
      const isSame = currentProg === name && currentReg === reg;

      return {
        ...state,
        singleSelect: {
          ...state.singleSelect,
          [progKey]: isSame ? null : name,
          [otherKey]: null,
          selectedRegion: isSame ? null : reg,
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
    case 'RESET_FILTERS':
      return initialState;
    default:
      return state;
  }
}

export function useQeRelokFilters(rawRows = []) {
  const [state, dispatch] = useReducer(filterReducer, initialState);

  const filteredRows = useMemo(() => {
    if (!rawRows || rawRows.length === 0) return [];

    return rawRows.filter(row => {
      if (state.singleSelect.district && row.district !== state.singleSelect.district) {
        return false;
      }
      if (state.singleSelect.statusProgres && row.statusProgres !== state.singleSelect.statusProgres) {
        return false;
      }
      if (state.singleSelect.klasifikasiLop && row.klasifikasiLop !== state.singleSelect.klasifikasiLop) {
        return false;
      }
      if (state.singleSelect.subconTa && row.subconTa !== state.singleSelect.subconTa) {
        return false;
      }
      if (state.singleSelect.batch && row.batch !== state.singleSelect.batch) {
        return false;
      }
      if (state.singleSelect.closedOnly && !row.isClosed) {
        return false;
      }
      if (state.singleSelect.hasRealisasi && !(row.nilaiRealisasi > 0)) {
        return false;
      }
      if (state.singleSelect.progressLapangan && row.statusProgres !== state.singleSelect.progressLapangan) {
        return false;
      }
      if (state.singleSelect.subStatus && row.detailStatus !== state.singleSelect.subStatus) {
        return false;
      }
      if (state.singleSelect.selectedRegion && row.region !== state.singleSelect.selectedRegion) {
        return false;
      }

      if (state.multiSelect.district.size > 0 && !state.multiSelect.district.has(row.district)) {
        return false;
      }
      if (state.multiSelect.statusProgres.size > 0 && !state.multiSelect.statusProgres.has(row.statusProgres)) {
        return false;
      }

      return true;
    });
  }, [rawRows, state.singleSelect, state.multiSelect]);

  const toggleSingleSelect = useCallback((key, value) => {
    dispatch({ type: 'TOGGLE_SINGLE_SELECT', payload: { key, value } });
  }, []);

  const toggleMultiSelectItem = useCallback((key, value) => {
    dispatch({ type: 'TOGGLE_MULTI_SELECT_ITEM', payload: { key, value } });
  }, []);

  const setCellFilter = useCallback((type, name, reg) => {
    dispatch({ type: 'SET_CELL_FILTER', payload: { type, name, reg } });
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
    toggleMultiSelectItem,
    setCellFilter,
    resetFilters,
    isFiltered,
  };
}
