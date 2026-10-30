import { Icon } from '@brilliant/bds-core';
import { useLocalize } from '~/i18n/I18nContext';
import { CopyPrompt } from '../CopyPrompt/CopyPrompt';
import { PaneLayout } from '../EditPanel/Panes';

export function GraphBuilderUserGuide({ onClose }: { onClose: () => void }) {
    const localize = useLocalize();
    return (
        <PaneLayout
            title={localize('dashboards.aiBuilder.userGuide.headline')}
            className="z-50 flex h-full flex-col gap-5xl bg-primary py-md text-secondary bv-text-font-md-regular"
        >
            <button
                onClick={onClose}
                className="absolute right-4 top-4 hover:cursor-pointer"
            >
                <Icon icon="bv:close" width={28} height={28} />
            </button>
            <div>
                <p>{localize('dashboards.aiBuilder.userGuide.disclaimer')}</p>
            </div>
            <div>
                <h3 className="mb-1 bv-text-font-md-medium">
                    {localize('dashboards.aiBuilder.userGuide.can.p1')}
                </h3>
                <p className="mb-2">
                    {localize('dashboards.aiBuilder.userGuide.can.p2')}
                </p>
                <div className="flex justify-around">
                    <ul className="list-disc">
                        <li>
                            {localize('dashboards.aiBuilder.userGuide.can.p3')}
                        </li>
                        <li>
                            {localize('dashboards.aiBuilder.userGuide.can.p4')}
                        </li>
                        <li>
                            {localize('dashboards.aiBuilder.userGuide.can.p5')}
                        </li>
                        <li>
                            {localize('dashboards.aiBuilder.userGuide.can.p6')}
                        </li>
                    </ul>
                    <ul className="list-disc">
                        <li>
                            {localize('dashboards.aiBuilder.userGuide.can.p7')}
                        </li>
                        <li>
                            {localize('dashboards.aiBuilder.userGuide.can.p8')}
                        </li>
                        <li>
                            {localize('dashboards.aiBuilder.userGuide.can.p9')}
                        </li>
                        <li>
                            {localize('dashboards.aiBuilder.userGuide.can.p10')}
                        </li>
                    </ul>
                </div>
            </div>
            <div>
                <h3 className="mb-1 bv-text-font-md-medium">
                    {localize('dashboards.aiBuilder.userGuide.cannot.p1')}
                </h3>
                <p>{localize('dashboards.aiBuilder.userGuide.cannot.p2')}</p>
            </div>
            <div className="pb-11">
                <h3 className="mb-1 bv-text-font-md-medium">
                    {localize('dashboards.aiBuilder.userGuide.howToSuccess.p1')}
                </h3>
                <p className="mb-2">
                    {localize('dashboards.aiBuilder.userGuide.howToSuccess.p2')}
                </p>
                <ul className="list-disc px-6">
                    <CopyPrompt
                        prompt={localize(
                            'dashboards.aiBuilder.userGuide.howToSuccess.p3'
                        )}
                    />
                    <CopyPrompt
                        prompt={localize(
                            'dashboards.aiBuilder.userGuide.howToSuccess.p4'
                        )}
                    />
                    <CopyPrompt
                        prompt={localize(
                            'dashboards.aiBuilder.userGuide.howToSuccess.p5'
                        )}
                    />
                </ul>
            </div>
        </PaneLayout>
    );
}
