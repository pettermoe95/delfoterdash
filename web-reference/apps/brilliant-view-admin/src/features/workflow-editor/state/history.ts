import type { WorkflowDocument } from '../model/schema';

export type History<T = WorkflowDocument> = {
    past: T[];
    present: T;
    future: T[];
    group?: string;
};
export type HistoryAction<T = WorkflowDocument> =
    | {
          type: 'edit';
          update: (document: T) => T;
          group?: string;
      }
    | { type: 'reset'; document: T }
    | { type: 'undo' | 'redo' | 'endGroup' };
export const createHistory = <T>(document: T): History<T> => ({
    past: [],
    present: document,
    future: [],
});
export function historyReducer<T>(
    state: History<T>,
    action: HistoryAction<T>
): History<T> {
    switch (action.type) {
        case 'reset':
            return createHistory(action.document);
        case 'endGroup':
            return { ...state, group: undefined };
        case 'edit': {
            const next = action.update(state.present);
            if (JSON.stringify(next) === JSON.stringify(state.present))
                return state;
            return {
                present: next,
                past:
                    action.group && action.group === state.group
                        ? state.past
                        : [...state.past.slice(-99), state.present],
                future: [],
                group: action.group,
            };
        }
        case 'undo': {
            const previous = state.past[state.past.length - 1];
            return state.past.length
                ? {
                      present: previous,
                      past: state.past.slice(0, -1),
                      future: [state.present, ...state.future],
                  }
                : state;
        }
        case 'redo': {
            const next = state.future[0];
            return state.future.length
                ? {
                      present: next,
                      past: [...state.past, state.present],
                      future: state.future.slice(1),
                  }
                : state;
        }
    }
}
