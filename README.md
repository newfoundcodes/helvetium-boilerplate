<div align="center">
  <img src="https://github.com/newfoundcodes/newfoundcodes-logo/blob/main/newfoundcodes-helvetium.png?raw=true" width="128" />
  <h1>Helvetium Boilerplate</h1>
  <p>
    <a href="https://github.com/newfoundcodes/helvetium-boilerplate/actions"><img src="https://github.com/newfoundcodes/helvetium-boilerplate/actions/workflows/ci.yml/badge.svg" alt="Build Status"></a>
  </p>
</div>

Template to initialize a production-ready full-stack Helvetium application. The generated project uses Helvetium Boot for HTTP/server execution, Helvetium DOM for SSR + hydrated client navigation, and Helvetium Alps for persistence and migrations.

## Generate

```bash
npx @newfoundcodes/helvetium-boilerplate ./my-app --install
```

Or from the future Helvetium CLI/programmatically:

```ts
import { createProject } from '@newfoundcodes/helvetium-boilerplate';
await createProject({ targetDirectory: './my-app', install: true });
```

The template intentionally keeps route registration, route handlers, UI pages/components, middleware, database schema, migrations, environment loading, and process startup separate.

| Directory / File      | Purpose                                                 |
| --------------------- | ------------------------------------------------------- |
| `background/`         | Background worker definitions and Apiary queue instance |
| `background/index.ts` | Initialization of Helvetium Apiary queue                |
| `background/workers/` | Your background job implementations                     |
| `src/app/`            | Reusable DOM components and application models.         |
| `src/routes/`         | Boot HTTP routes and isomorphic DOM pages.              |
| `src/routes/mcp/`     | Sample Model Context Protocol server tools.             |
| `src/database/`       | Alps relational tables and repositories.                |
| `src/middlewares/`    | Helvetium Boot router middleware.                       |
| `src/server.tsx`      | SSR root composition and HTML skeleton.                 |
| `src/web.ts`          | Browser application entry point.                        |
| `server.ts`           | The Boot HTTP server process entry point.               |
| `migrations/`         | Generated database schema migrations.                   |
| `scripts/`            | Utilities and CLI command extensions.                   |

## License

This project is licensed under the [AGPL-3.0-only](https://spdx.org/licenses/AGPL-3.0-only.html) License.
