import { useEffect } from 'react';
import { useBeforeUnload, useBlocker } from 'react-router-dom';

export function useUnsavedChanges(dirty: boolean) {
    useBeforeUnload((event) => {
        if (dirty) {
            event.preventDefault();
            event.returnValue = '';
        }
    });
    const blocker = useBlocker(dirty);
    useEffect(() => {
        if (blocker.state !== 'blocked') return;
        if (window.confirm('Leave with unsaved workflow changes?'))
            blocker.proceed();
        else blocker.reset();
    }, [blocker]);
}
