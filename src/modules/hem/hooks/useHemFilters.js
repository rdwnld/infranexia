import { useReducer, useMemo, useCallback } from 'react';
import { STAGES, SUB_STAGES_PERSIAPAN } from '../hem.stageRules';

const initialState = {
  singleSelect: {
    district: null,
    stage: null,
    subStagePersiapan: null,
    agingBucket: null,
    batchOrder: null,
    subkon: null,
    mitra: null,
    commitmentPeriod: null,
    profilingCard: null,
    progressLapangan: null,
    subStatus: null,
    selectedRegion: null,
  },
  multiSelect: {
    district: new Set(),
    stage: new Set(),
    priorityByRSO: new Set(),
    commitmentPeriod: new Set(),
  },
  localToggles: {
    achGroupBy: 'district', // district, batch, subkon
  }
};

function filterReducer(state, action) {
  switch (action.type) {
    case 'TOGGLE_SINGLE_SELECT': {
      const { key, value } = action.payload;
      const current = state.singleSelect[key];
      const nextVal = current === value ? null : value;
      return {
        ...state,
        singleSelect: {
          ...state.singleSelect,
          [key]: nextVal,
          ...(key === 'profilingCard' && nextVal ? {
            progressLapangan: null,
            subStatus: null,
            selectedRegion: null,
          } : {})
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
          profilingCard: null,
          [progKey]: isSame ? null : name,
          [otherKey]: null,
          selectedRegion: isSame ? null : reg,
        }
      };
    }
    case 'SET_MULTI_SELECT': {
      const { key, values } = action.payload;
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

export function useHemFilters(rawRows = []) {
  const [state, dispatch] = useReducer(filterReducer, initialState);

  const cardFilteredRows = useMemo(() => {
    if (!rawRows || rawRows.length === 0) return [];

    return rawRows.filter(row => {
      // Single-select filters (AND logic)
      if (state.singleSelect.district && row.district !== state.singleSelect.district) return false;
      if (state.singleSelect.stage && row.stage !== state.singleSelect.stage) return false;
      if (state.singleSelect.subStagePersiapan && row.subStagePersiapan !== state.singleSelect.subStagePersiapan) return false;
      if (state.singleSelect.agingBucket && row.agingBucket !== state.singleSelect.agingBucket) return false;
      if (state.singleSelect.batchOrder && row.batchOrder !== state.singleSelect.batchOrder) return false;
      if (state.singleSelect.subkon && row.subkon !== state.singleSelect.subkon) return false;
      if (state.singleSelect.mitra && row.mitra !== state.singleSelect.mitra) return false;
      if (state.singleSelect.commitmentPeriod && row.tglOrder !== state.singleSelect.commitmentPeriod) return false;
      if (state.singleSelect.selectedRegion && row.region !== state.singleSelect.selectedRegion) return false;

      // Multi-select filters (AND logic)
      if (state.multiSelect.district.size > 0 && !state.multiSelect.district.has(row.district)) return false;
      if (state.multiSelect.stage.size > 0 && !state.multiSelect.stage.has(row.progressLapangan)) return false;
      if (state.multiSelect.priorityByRSO.size > 0 && !state.multiSelect.priorityByRSO.has(row.priorityByRSO)) return false;
      if (state.multiSelect.commitmentPeriod.size > 0 && !state.multiSelect.commitmentPeriod.has(row.targetGolive)) return false;

      return true;
    });
  }, [rawRows, state.singleSelect, state.multiSelect]);

  const filteredRows = useMemo(() => {
    return cardFilteredRows.filter(row => {
      if (state.singleSelect.profilingCard && state.singleSelect.profilingCard !== 'ALL') {
        const card = state.singleSelect.profilingCard;
        const isHold = row.subStagePersiapan === SUB_STAGES_PERSIAPAN.HOLD || (row.progressLapangan && row.progressLapangan.toUpperCase().includes('HOLD'));
        const isDrop = row.stage === STAGES.APPROVED_DROP || row.stage === STAGES.PROPOSED_DROP;
        const isGolive = row.stage === STAGES.GOLIVE_UT;
        const isBisaPt1 = row.stage === STAGES.BISA_PT1;
        const isOgp = !isGolive && !isDrop && !isHold && !isBisaPt1;

        if (card === 'GOLIVE' && !isGolive) return false;
        if (card === 'BISA_PT1' && !isBisaPt1) return false;
        if (card === 'OGP' && !isOgp) return false;
        if (card === 'DROP' && !isDrop) return false;
        if (card === 'HOLD' && !isHold) return false;
      }

      if (state.singleSelect.progressLapangan && row.progressLapangan !== state.singleSelect.progressLapangan) return false;
      if (state.singleSelect.subStatus && row.subStatus !== state.singleSelect.subStatus) return false;

      return true;
    });
  }, [cardFilteredRows, state.singleSelect.profilingCard, state.singleSelect.progressLapangan, state.singleSelect.subStatus]);

  const toggleSingleSelect = useCallback((key, value) => {
    dispatch({ type: 'TOGGLE_SINGLE_SELECT', payload: { key, value } });
  }, []);

  const toggleMultiSelectItem = useCallback((key, value) => {
    dispatch({ type: 'TOGGLE_MULTI_SELECT_ITEM', payload: { key, value } });
  }, []);

  const setLocalToggle = useCallback((key, value) => {
    dispatch({ type: 'SET_LOCAL_TOGGLE', payload: { key, value } });
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
    cardFilteredRows,
    toggleSingleSelect,
    toggleMultiSelectItem,
    setLocalToggle,
    setCellFilter,
    resetFilters,
    isFiltered,
  };
}
