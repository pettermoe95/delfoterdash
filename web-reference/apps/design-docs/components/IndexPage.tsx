import { Button } from '@brilliant/bds-core';

const siteParts = ['Core', 'View UI'] as const;

export function IndexPage() {
    return (
        <div
            style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 'var(--spacing-lg)',
            }}
        >
            <BrandImage />
            <h2>Libraries</h2>
            <div
                style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(3, 1fr)',
                    gridAutoRows: '150px',
                    gap: 'var(--spacing-xl)',
                }}
            >
                {siteParts.map((part) => (
                    <IndexCard key={part} folder={part} />
                ))}
            </div>
        </div>
    );
}

type IndexCardProps = {
    folder: string;
    filename?: string;
};

function IndexCard({ folder, filename = 'README' }: IndexCardProps) {
    const href = `/?path=/docs/${folder.toLowerCase().replaceAll(' ', '-')}-${filename}--docs`;
    return (
        <Button
            variant="outlined"
            color="secondary"
            className="justify-center"
            asChild
        >
            <a
                href={href}
                style={{
                    font: 'var(--display-font-md-regular)',
                    color: 'var(--colors-secondary-violet-500)',
                }}
            >
                {folder}
            </a>
        </Button>
    );
}

export function BrandImage() {
    return (
        <img
            src="/bds-core-blue.png"
            style={{
                maxWidth: '600px',
                margin: '0 auto',
                marginBottom: '50px',
            }}
        />
    );
}
