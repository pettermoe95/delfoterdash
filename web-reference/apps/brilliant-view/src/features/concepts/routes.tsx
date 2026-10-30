import { Route } from 'react-router-dom';
import { ConceptsPage } from './pages';

export const CONCEPTS_ROUTES = {
    concepts: '/concepts',
} as const;

export const ConceptsRoutes = (
    <>
        <Route path={CONCEPTS_ROUTES.concepts} element={<ConceptsPage />} />
    </>
);
