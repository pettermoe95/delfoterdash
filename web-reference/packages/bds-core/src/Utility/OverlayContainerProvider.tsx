import { createContext, useContext } from 'react';

const OverlayContainerContext = createContext<HTMLElement | null | undefined>(
    undefined
);

// Default portal container for dialogs and sheets. Omit to use document.body
export const OverlayContainerProvider = OverlayContainerContext.Provider;

export function useOverlayContainer() {
    return useContext(OverlayContainerContext);
}
