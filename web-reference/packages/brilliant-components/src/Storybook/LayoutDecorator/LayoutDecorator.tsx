import clsx from 'clsx';
import type { ReactNode } from 'react';
import { useState } from 'react';
import styles from './LayoutDecorator.module.scss';
import { Column, Grid, Row } from '../../Layout';

type LayoutDecoratorProps = {
    children: ReactNode;
};

type LayoutType = 'default' | 'row' | 'column' | 'grid';

export function LayoutDecorator({ children }: LayoutDecoratorProps) {
    const [enabled, setEnabled] = useState<boolean>(false);
    const [layout, setLayout] = useState<LayoutType>('default');

    function layoutButton(newLayout: LayoutType) {
        const selected = layout === newLayout;
        return (
            <div className={clsx(styles.tool_button, selected && styles.selected)} onClick={() => setLayout(newLayout)}>
                {newLayout}
            </div>
        );
    }

    function wrappedChild() {
        if (!enabled) {
            return children;
        }
        switch (layout) {
            case 'default':
                return <div className={styles.child_wrapper}> {children} </div>;
            case 'row':
                return (
                    <Row className={styles.child_wrapper}>
                        {children}
                        {children}
                    </Row>
                );
            case 'column':
                return (
                    <Column className={styles.child_wrapper}>
                        {children}
                        {children}
                    </Column>
                );
            case 'grid':
                return (
                    <Grid templateRows="1fr 1fr" templateColumns="1fr 1fr" className={styles.child_wrapper}>
                        {children}
                        {children}
                        {children}
                        {children}
                    </Grid>
                );
        }
    }

    return (
        <div className={styles.container}>
            {!enabled && <div> {children} </div>}
            {enabled && (
                <>
                    <div className={styles.tool_box}>
                        {layoutButton('default')}
                        {layoutButton('row')}
                        {layoutButton('column')}
                        {layoutButton('grid')}
                    </div>
                    {wrappedChild()}
                </>
            )}
            <div className={styles.enable_button} onClick={() => setEnabled(!enabled)}>
                {enabled ? 'Hide Layout' : 'Show Layout'}
            </div>
        </div>
    );
}
