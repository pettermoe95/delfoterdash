import styles from './GraphStoryWrapper.module.scss';

const GraphStoryWrapper: React.FC<{
    children: React.ReactNode;
    isDocs: boolean;
}> = ({ children, isDocs }) => {
    return (
        <div
            data-component-name="graph-story-wrapper"
            className={isDocs ? styles.docsWrapper : styles.wrapper}
        >
            {children}
        </div>
    );
};

export default GraphStoryWrapper;
export { GraphStoryWrapper };
