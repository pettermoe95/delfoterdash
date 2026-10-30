import { Button } from '@brilliant/bds-core';

const contentStories = ['Tooltip', 'DropdownMenu', 'Avatar'] as const;
const inputStories = [
    'Checkbox',
    'SingleSelect',
    'TextField',
    'Toggle',
] as const;

export function CoreIndex() {
    return (
        <div>
            <div className="flex flex-col gap-3xl">
                <ComponentGroup
                    title="Content"
                    prefix="core-content"
                    stories={contentStories}
                />
                <ComponentGroup
                    title="Inputs"
                    prefix="core-inputs"
                    stories={inputStories}
                />
            </div>
        </div>
    );
}

type ComponentListingProps = {
    title: string;
    prefix: string;
    stories: string[] | ReadonlyArray<string>;
};
function ComponentGroup({ title, prefix, stories }: ComponentListingProps) {
    const getComponentHref = (name: string) =>
        `/?path=/docs/${prefix}-${name.toLowerCase()}--docs`;

    return (
        <article>
            <h3>{title}</h3>
            <div
                style={{
                    display: 'flex',
                    gap: '1rem',
                }}
            >
                {stories.map((name) => (
                    <Button asChild variant="outlined">
                        <a href={getComponentHref(name)}>{name}</a>
                    </Button>
                ))}
            </div>
        </article>
    );
}
