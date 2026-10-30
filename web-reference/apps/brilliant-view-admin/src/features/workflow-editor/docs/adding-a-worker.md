# Adding a worker to Workflow Editor V2

Most workers need one definition file, one registry entry and a representative configuration in the contract tests. The shared editor supplies the palette item, canvas node, properties form, connections, validation navigation, save/load, undo and live execution status. The JSON inspector in More is read-only.

This guide covers the frontend integration. The backend must already support the worker and its configuration before it can execute.

## 1. Establish the execution contract

Check the worker implementation and configuration model in `brilliant_view_workflows`. Record:

-   The exact backend worker name, including capitalization.
-   Configuration property names, types, defaults and required fields.
-   Which fields accept `null`, which may be omitted, and which accept empty strings.
-   Authentication and credential references.
-   Whether configuration refers to upstream job IDs or needs a separate entry for each connected worker.

Keep the backend's property names and object structure in the Zod schema. Presentation labels belong in field hints; avoid adding a second frontend configuration format or serialization layer.

Three names have different purposes:

| Definition property | Purpose                                                | Existing example |
| ------------------- | ------------------------------------------------------ | ---------------- |
| `type`              | Stable editor identifier, saved in the V2 document     | `DimJob`         |
| `worker`            | Backend worker name written to execution configuration | `DimWorker`      |
| `name`              | Human-readable palette and properties title            | `Dim (Legacy)`   |

Make `type` unique and keep it stable after workflows have been saved. The editable name shown on a canvas node is the individual job's ID, not the definition's `name`.

## 2. Define the schema and metadata

Put the definition under the appropriate directory in [workers](../workers): `fetch/`, `load/`, `model/` or `store/`. Use a separate file when the configuration is substantial; extract related schemas or hooks into nearby files as they grow.

The following is an illustrative definition for `workers/fetch/example.ts`. `ExampleFetcher` and its configuration are fictional: replace them with the actual backend contract.

```ts
import { z } from 'zod';
import { authentication, stringMap } from '../shared';
import type { WorkerDefinition } from '../types';

export const exampleFetcherSchema = z
    .object({
        url: z.string().url(),
        authentication,
        headers: stringMap().default({}),
        requestTemplate: z.string().nullable().optional(),
        timeoutSeconds: z.number().int().positive().default(30),
    })
    .passthrough();

export type ExampleFetcherConfig = z.infer<typeof exampleFetcherSchema>;

export const exampleFetcher: WorkerDefinition = {
    type: 'ExampleFetcher',
    worker: 'ExampleFetcher',
    name: 'Example Fetcher',
    category: 'Fetch',
    description: 'Fetch records from an example service.',
    schema: exampleFetcherSchema,
    fields: {
        url: { label: 'Service URL' },
        authentication: { section: 'Authentication' },
        requestTemplate: {
            control: 'code',
            help: 'Request template sent to the service.',
        },
        timeoutSeconds: { section: 'Advanced' },
    },
};
```

Infer configuration types with `z.infer`; do not maintain matching interfaces by hand. Use helpers from [workers/shared.ts](../workers/shared.ts) when their semantics match the backend. For example, `text()` trims and requires a nonempty string, whereas `optionalText()` accepts strings, `null` and omission.

Use `.passthrough()` on each configuration object, including nested objects and union variants, so fields introduced by a newer backend survive editing and saving. A passthrough on the root does not preserve unknown properties inside nested objects.

### Defaults and drafts

The editor deliberately permits incomplete configurations. [initialValue](../forms/schema.ts) initializes controls without requiring the schema to parse:

-   Explicit `.default(...)` values are used first.
-   Optional or nullable fields start unconfigured unless an outer default supplies a value.
-   Required objects initialize recursively; arrays and records start empty.
-   Enums and unions initially use the first option or variant.
-   Required strings start empty, numbers start at `0`, and booleans start at `false`.

Choose defaults that match the backend, especially when `0` or an empty string would be invalid. Wrapper order matters: `z.number().optional().default(30)` starts at `30`, while `z.number().default(30).optional()` starts unconfigured.

Validation uses the schema, and saving a valid configuration sends its parsed values, including defaults. The saved layout retains the editable draft. Avoid transforms that change the configuration's shape or value types: the generated form edits the original schema structure. Use the definition's `validate` hook for relationships between fields when needed.

## 3. Describe the properties editor

Labels are generated from field names. Add hints only to improve the default presentation. [FieldHint](../workers/types.ts) supports:

| Hint                    | Behavior                                                                                |
| ----------------------- | --------------------------------------------------------------------------------------- |
| `label`                 | Overrides the generated field label                                                     |
| `help`                  | Displays explanatory text below the field                                               |
| `section`               | Places a top-level property in a named properties tab                                   |
| `layout: 'compact'`     | Uses denser spacing and inline labels for object-list fields in that property's section |
| `control: 'code'`       | Uses a multiline text area                                                              |
| `control: 'credential'` | Uses the tenant credential selector                                                     |
| `reference: 'job'`      | Uses the connected-worker selector and remaps the value on rename/import                |
| `ordered: true`         | Shows a left drag handle for reordering an array; lists are unordered by default        |
| `control: 'column'`     | Offers configured upstream column suggestions                                           |

List items use compact rows with inline object labels. Arrays show remove controls by default; set `ordered: true` on the array field when sequence affects behavior. Drag the left handle to reorder, or focus it and use the Up/Down keys. Existing ordered fields include composite identity columns, GraphQL path components and Dim column-priority worker lists. Incoming connections use the same handles in the Inputs tab; this updates dependency order and synchronizes Dim input slots while preserving their configuration.

Properties without a section appear in **Configuration**. **Inputs** is built in and appears last; a section named **Inputs** places configuration alongside connection management. Assign sections to top-level properties: a nested hint's `section` does not move its parent object to that tab.

Hints use complete dotted paths. Use `*` for one array item or record entry: `dataConfig.inputs.*.identityColumn` applies to every input, and `credentialVariables.*.credentialId` applies to each named credential variable. Hints never fall back to matching the final field name.

The renderer supports strings, numbers, booleans, enums, objects, arrays, records, optional/nullable values, unions and discriminated unions. Prefer `z.discriminatedUnion(...)` for configuration variants with distinct object shapes; the discriminator becomes a variant selector. See [SOAP pagination](../workers/fetch/soap.ts) for an example.

Declare special controls explicitly, for example `'authentication.credentialId': { control: 'credential' }` or `'dataConfig.inputs.*.jobId': { reference: 'job' }`. Ordinary HTTP parameters, headers and GraphQL variables remain scalar fields regardless of their names. Reuse the common hint groups in [fieldHints.ts](../workers/fieldHints.ts) for authentication, databases, loader columns and relations. Column suggestions come from configured upstream fields, not a backend output preview. Although `entity` is currently allowed by the `FieldHint.control` type, it has no dedicated selector implementation; it renders as an ordinary scalar field.

Authentication is configured separately for each worker. Reuse credential IDs and the shared authentication schema where appropriate; do not add credential resource nodes or store credential secrets in configuration.

If a genuinely new control is needed, extend the shared renderer in [forms](../forms) and give any new components explicit prop types. Keep worker-specific configuration UI out of canvas nodes.

Workers with a `databaseConfig` property can opt into workflow-local named database connections with `fields: { ...databaseHints, databaseConfig: { control: 'database', section: 'Database' } }`. The properties editor then supplies inline settings, a connection selector, promotion and detaching. Keep the backend database schema in the worker schema; validation and serialization resolve connection references before using it. See [database connections](../README.md#database-connections) for persistence and import behavior.

## 4. Register the worker

Import the definition in [workers/registry.ts](../workers/registry.ts) and add it to the exported `workers` array:

```ts
import { exampleFetcher } from './fetch/example';

// Add alongside the existing definitions:
// export const workers: WorkerDefinition[] = [
//     ...,
//     exampleFetcher,
// ];
```

The palette, properties editor and execution serialization all use this registry. Normal additions require no new routes, node components, toolbar actions or persistence branches. The category controls palette grouping and the shared node color.

## 5. Add connection or validation hooks only when needed

Every worker waits for all connected dependencies. A connection does not automatically create per-input configuration, and most workers need no hooks.

Use `onConfigChange(config, previous?)` for derived configuration values. It runs when creating a worker (without `previous`) and when updating its configuration through the properties fields. Keep it pure and tolerant of incomplete drafts. The returned configuration is part of the same undo step as the user's edit. It does not run on load, import or undo/redo. See [SOAP header synchronization](../workers/fetch/soapHeaders.ts), which sets Content-Type on creation or a SOAP version change and keeps generated SOAP 1.2 action parameters in sync.

Use `onDependenciesChange(config, dependencies)` when connection changes should update configuration entries. It must return a new configuration, preserve unrelated fields and retain existing user choices for connections that remain. It must tolerate incomplete drafts. See [syncDimInputs](../workers/model/inputs.ts).

Use `validate(job, upstream)` for constraints involving multiple fields or connected workers. It runs only after the worker's Zod schema succeeds and receives the parsed configuration. Return issues such as:

```ts
{ path: 'dataConfig.inputs.0.identityColumn', message: 'Choose a unique identity column.' }
```

Paths are relative to `job.config`; omit `config.` and the job ID. Exact paths let the editor open the appropriate tab and focus the field. For connection errors, use `dependencies`. See [validateDimInputs](../workers/model/validate.ts) for a complete implementation. Keep hooks pure and independent of React, network requests and editor state.

Declare every job reference with `reference: 'job'` at its full field path. The same metadata drives both its selector and rename/copy/import remapping, so a new reference field needs no graph-editing code. For lists, declare the individual values, e.g. `'dataConfig.columnPriorities.*.jobIds.*': { reference: 'job' }`. Unknown configuration and literal values are preserved.

Dependency waiting and input payload shape are separate contracts. Dim V2 receives outputs keyed by upstream job ID; other workers currently receive merged output fields. Frontend hooks cannot change this execution behavior.

## 6. Add focused coverage and verify

Add a valid configuration under the new editor `type` in the `configs` map in [workers/contracts.test.ts](../workers/contracts.test.ts). The existing registry-driven test then checks schema acceptance and preservation of a future root field. For the illustrative definition:

```ts
ExampleFetcher: {
    url: 'https://example.com/records',
    timeoutSeconds: 30,
},
```

Add a meaningful invalid example, such as a nonpositive timeout, and assertions for important defaults or nested unknown-field preservation when relevant. If hooks are added, test their real edge cases: preserving input configuration after a connection changes, disconnected references, or duplicate identities. Avoid snapshots of the generated form or repetitive tests for every scalar field.

Run from the repository root:

```sh
pnpm --filter brilliant-view-admin typecheck
pnpm --filter brilliant-view-admin test
pnpm --filter brilliant-view-admin build
pnpm exec prettier --check apps/brilliant-view-admin/src/features/workflow-editor
```

In the browser, verify that you can drag the worker onto the canvas, edit its generated fields and tabs, follow validation issues to the correct field, connect inputs, undo changes, explicitly save and reload. Inspect exported execution configuration or a save request to confirm the backend worker name and configuration shape. Run against a backend supporting the worker to verify execution and status updates.

Only change [legacy conversion](../legacy) if there is an actual older layout format for this worker to support. Adding a worker alone does not require legacy conversion. The original editor UI has been removed.
