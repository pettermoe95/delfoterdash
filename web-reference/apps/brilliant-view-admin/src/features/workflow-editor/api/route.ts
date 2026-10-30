import { APP_ROUTES } from '~/routes/routes';
import { generatePath, redirect } from 'react-router-dom';
import type { LoaderFunctionArgs } from 'react-router-dom';

/** Preserve bookmarks to the former V2-specific URL without fetching the workflow twice. */
export function redirectWorkflowEditor({ params }: LoaderFunctionArgs) {
    return redirect(
        params.workflowId
            ? generatePath(APP_ROUTES.workflow_editor, {
                  workflowId: params.workflowId,
              })
            : APP_ROUTES.customers
    );
}
