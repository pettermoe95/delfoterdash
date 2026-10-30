import { PaneLayout } from './PaneLayout';
import type { PaneProps } from './panes';

export function EditComponentsPane(props: PaneProps) {
    return (
        <PaneLayout onBack={props.resetPane}>
            <div>Adding Components</div>
        </PaneLayout>
    );
}
