# Workflow Editor V2

The workflow editor opens at `/workflow/editor/:workflowId` when you click a workflow in the admin panel or open a newly created workflow. The workflow row's action menu also offers a direct link. The former `/workflow/editor-v2/:workflowId` URL redirects to the standard route. The original editor UI has been removed; stored legacy layouts are still converted when opened.

## Worker definitions

See [Adding a worker](docs/adding-a-worker.md) for a step-by-step guide, a definition example, presentation hints, connection hooks and verification.

Each worker declares its backend name, Zod configuration schema, palette metadata and optional field hints in `workers/`. Configuration uses the backend's field names and shapes. Infer configuration types from the schemas rather than maintaining a second interface.

`forms/` renders objects, arrays, maps, enums, optional fields and discriminated unions recursively. Labels come from field names; hints override labels, help text, sections and controls. Special controls use explicit full-path metadata: `control: 'credential'` selects tenant credentials, `control: 'column'` offers column suggestions, and `reference: 'job'` selects connected workers and enables reference remapping. Use `*` for array items or record entries; field names alone never trigger special behavior. Lists use compact rows; ordering controls are opt-in through `ordered: true` for sequences such as identity columns, GraphQL paths and Dim priorities. Incoming connections can be reordered in Inputs, with their order saved in dependencies and synchronized to Dim inputs. Workers share the same canvas node.

To add a worker:

1. Define a Zod schema next to its worker category, including backend defaults. Use `.passthrough()` on configuration objects so future fields survive editing.
2. Add a definition to `workers/registry.ts`, with hints only where the default presentation needs adjustment.
3. If needed, provide `validate` for relationships between fields or upstream workers, `onDependenciesChange` for input configuration that follows connections, and `onConfigChange` for related values that must stay synchronized. `onConfigChange(config, previous?)` runs on creation (without `previous`) and configuration edits; SOAP and JSON Fetcher use it for default headers. Keep these functions next to the worker definition. Ordinary workers need no hooks.
4. Add a representative configuration and a meaningful failure case to the contract tests.

The schema renderer's Zod introspection is isolated in `forms/`. If a configuration eventually needs a dedicated visual control, extend the renderer's presentation controls rather than putting forms back into canvas nodes.

## Document and state

`model/schema.ts` defines the versioned document. Jobs own their configuration, position, dependencies and execution fields such as initial payloads. Edges are derived from dependencies, so graph state has one source of truth. Runtime selection and execution activity are excluded from persistence.

`state/history.ts` keeps immutable document snapshots, groups typing and dragging, and caps undo history. Graph operations remap only fields declared with `reference: 'job'` during rename and import. Configuration validation reuses its results during position-only edits; connection checks use one strongly connected component traversal. Import appends workers with collision-free IDs and retains the current workflow's settings. Paste centers the added workers in the visible canvas while preserving their relative positions and the current view. Import fits the canvas view to the added workers. Export includes the complete V2 document, including credential references and database configuration; it does not retrieve credential secrets.

More → Arrange workers uses [Dagre](https://github.com/dagrejs/dagre) to reduce crossings across columns and favor horizontal chains, including connections that span columns. Independent pipelines get separate vertical lanes. The layout accounts for the fixed worker dimensions and fits the canvas to the result. It changes only positions, creates one undo step and requires explicit saving. Cyclic graphs must be corrected before arrangement. Crossing reduction is a heuristic; complex graphs can still require angled or crossing connections.

Validation issues in the footer, properties panels and canvas nodes are clickable. Selecting an issue opens the relevant worker and properties tab, centers the worker, and focuses and briefly highlights the affected field. Nested configuration paths and workflow settings use the same navigation mechanism.

Save is explicit. Property changes update the local document immediately. Incomplete configuration and schedule drafts remain editable after reloading. Because the backend decodes schedule settings during every save, persistence sends valid fallback scheduling/range settings when the layout contains an incomplete draft. Scheduled execution must be disabled before saving an incomplete workflow. Run validates either the local version before saving or a freshly fetched saved version, depending on the selected action.

## Database connections

Shared connections support PostgreSQL and SQL Server. New connections start with a PostgreSQL draft. Brilliant View remains an inline worker option and cannot be promoted to a shared connection.

Use **More → Database connections** to create named database configurations shared within the workflow. Ingest and Publish expose a **Database** tab where you can select a connection, keep inline settings, save existing inline settings as a connection, or detach a connection into an independent inline copy. The connection editor lists its consumers and prevents deletion while workers still use it. Names must be unique within the workflow; references use stable IDs, so renaming a connection does not change its bindings.

Connection definitions live in the optional `databaseConnections` document array; a worker's optional `databaseConnectionId` replaces its inline `databaseConfig`. Execution serialization resolves the current settings into each worker's normal backend configuration. Connection IDs and definitions are not sent as runtime fields, and no backend changes are required. Existing V2 layouts and inline configurations continue to load unchanged. Unknown database fields and credential IDs are retained; credential secrets are not retrieved.

Connection edits participate in workflow undo/redo and explicit saving. Validation covers names, database settings and missing references; clicking a shared configuration issue opens the connection editor and focuses the field. Drafts may be incomplete while scheduling is disabled, but missing references must be repaired before execution configuration can be built. Import and copy/paste include referenced connections, reuse identical definitions and remap ID/name collisions without binding workers to unrelated destination connections. Unused source connections are not imported.

Worker configuration is edited through the generated properties fields. The JSON inspector in More is read-only. SQL Server's `trustServerCertificate` option is honored by Publish; Ingest currently uses its existing backend certificate behavior.

## Legacy conversion

`legacy/` is the only implementation of the old layout and configuration formats. It supports old exports, resource nodes and reusable templates. Resource configurations are copied into each consuming worker; execution dependencies exclude resources. Existing execution configuration takes precedence over old UI fields, and unknown worker configurations and initial payloads are preserved. Opening a legacy workflow never saves automatically. Legacy conversion also removes inactive full-load date columns, filters optional SDMX/GraphQL path lists and retains the old unset/default behavior. A schema-driven normalization pass treats blank optional text as unset and restores declared defaults without changing required fields, unknown extensions or literal map values such as HTTP headers and query parameters. It runs when importing/loading documents, validating and saving, including shared database configurations. Previously converted V2 workflows that need repair are marked as unsaved; save explicitly before running affected saved execution settings.

Once all stored layouts and supported exports use version 2, remove `legacy/` and replace the two conversion branches in `api/persistence.ts` with `documentSchema.parse`. Legacy layout conversion remains isolated here and does not depend on the removed editor UI.

## Backend follow ups

The scheduler already waits for every declared dependency. Only Dim V2 currently receives upstream outputs separately, keyed by job ID. Other workers receive merged output fields, so connecting multiple workers does not give those workers Dim V2's independent input handling. Generalizing that payload contract requires backend and worker changes; V2 sends the existing execution contract.

Live worker updates use `api/jobUpdates.ts`: obtain a short-lived token from `/ws/token`, subscribe to the workflow on `/ws`, validate tenant/workflow-scoped events, reconnect on disconnect, and unsubscribe on close. `state/useLiveJobs.ts` keeps the latest status per job and up to 200 session events outside the saved document and undo history. Canvas statuses open the event payload and an environment-specific VictoriaLogs search. Activity combines worker events with editor actions. Subscription errors remain visible with an explicit retry action. Submitting a validated run clears canvas statuses before the trigger request, retaining session activity.

Activity → Timeline groups observed events by their stream run ID, separates concurrent executions and plots workers against event timestamps. Completed jobs show approximate durations; running jobs show updating elapsed times. Missing starts, missing run IDs and interrupted attempts are explicitly marked instead of guessing durations. Events can arrive out of order, and selecting a run keeps it selected as other runs arrive. The timeline shares the 200-event session buffer and is excluded from persistence.

The stream reports started, succeeded and failed events received while the editor is open; it does not provide historical states on opening or replay missed events after reconnecting. A retained run-history endpoint would allow recovery after disconnecting and inspection of earlier executions. The trigger response currently provides no run ID, so canvas statuses reflect the latest event received for each worker.

A separate persisted draft and active execution configuration would allow users to save incomplete drafts while keeping a valid scheduled version enabled. The current API stores one executable configuration, so V2 requires scheduling to be disabled for incomplete drafts.

## Validation

Run `pnpm --filter brilliant-view-admin typecheck`, `pnpm --filter brilliant-view-admin test` and `pnpm --filter brilliant-view-admin build` from the repository root. Tests cover worker wire configurations, legacy resources/templates, unknown fields, graph constraints, reference remapping, incomplete drafts and undo/redo.

Browser checks should cover node selection, dragging and connecting, property variants, credential selection, import/export, save failures, draft reload, running the saved version with invalid local edits, and unsaved navigation. Use mocked APIs for repeatable interaction checks; live status checks should simulate WebSocket acknowledgments, worker events, disconnects and subscription failures.
