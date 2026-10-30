import { createSafeContext } from '@brilliant/bds-core';

type GraphBuilderContext = {
    onClose: () => void;
};

export const [GraphBuilderProvider, useGraphBuilderContext] =
    createSafeContext<GraphBuilderContext>(
        'No GraphBuilderProvider found in the tree.'
    );
