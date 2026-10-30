import { useGraphTypes } from '.';

export const useAxisGraphType = () => {
    const { data, isLoading } = useGraphTypes();

    return {
        graphType: data?.find((type) => type.name === 'axis'),
        isLoading,
    };
};
