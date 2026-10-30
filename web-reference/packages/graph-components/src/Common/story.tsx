import { Card, Row } from '@brilliant/components';
import type { ReactNode } from 'react';

/**
 * Utility for stories showing sizes of graphs.
 * Useful to verify responsivity of graphs
 * Generator input is size in em units
 */
export function GraphSizeStory({
    generator,
}: {
    generator: (size: number) => ReactNode;
}) {
    return (
        <Row gap="xl" align="flex-end">
            {Array.from(new Array(6).keys()).map((idx) => {
                const size = idx * 3 + 8;
                return (
                    <div
                        style={{ width: size + 'em', height: size + 'em' }}
                        key={idx}
                    >
                        <Card width="100%" height="100%">
                            {generator(size)}
                        </Card>
                    </div>
                );
            })}
        </Row>
    );
}
