import { TOWERS } from './towers';
import type { Tower } from './types';
import { upgradeChanges } from './upgradeDetails';

export function TowerUpgrades({ tower }: { tower: Tower }) {
    const definition = TOWERS[tower.kind];
    let previous = { ...definition.stats };
    return (
        <section className="td-upgrade-guide" aria-label="Upgrade effects">
            <h4>Upgrade path</h4>
            {definition.upgrades.map((upgrade, index) => {
                const changes = upgradeChanges(previous, upgrade.stats);
                previous = { ...previous, ...upgrade.stats };
                const status =
                    index < tower.level
                        ? 'Purchased'
                        : index === tower.level
                          ? 'Next upgrade'
                          : 'Later upgrade';
                return (
                    <details
                        key={`${tower.kind}-${index}-${tower.level}`}
                        open={index === tower.level}
                    >
                        <summary>
                            <span>{upgrade.name}</span>
                            <small>
                                {status} · ◈ {upgrade.cost}
                            </small>
                        </summary>
                        <dl>
                            {changes.map((change) => (
                                <div key={change.key}>
                                    <dt>{change.label}</dt>
                                    <dd>
                                        <span>{change.before}</span> →{' '}
                                        <b>{change.after}</b>
                                    </dd>
                                </div>
                            ))}
                        </dl>
                    </details>
                );
            })}
        </section>
    );
}
