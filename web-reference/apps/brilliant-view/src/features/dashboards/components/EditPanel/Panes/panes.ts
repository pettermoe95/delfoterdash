import type { FC } from 'react';

export const EDIT_PANE_NAMES = ['default', 'graphStudio'] as const;
export type EditPaneName = (typeof EDIT_PANE_NAMES)[number];
export type EditPaneComponent = FC<PaneProps>;
export type EditPaneConfig = Record<EditPaneName, EditPaneComponent>;

export type PaneProps = {
    resetPane: () => void;
    setActivePane: (pane: EditPaneName) => void;
};
