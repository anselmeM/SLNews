# 10 — Dev Experience (10 tasks)

Improve developer tooling, configs, and code quality.

## D-01: ✓ Update TypeScript target
- **File:** `tsconfig.json:3`
- **Issue:** `"target": "ES2017"` — 2017 standard, missing modern features
- **Fix:** Change to `"ES2022"` for better performance and modern JS features

## D-02: Enable stricter TypeScript options
- **File:** `tsconfig.json`
- **Issue:** `"strict": true` is set but additional strictness flags are missing
- **Fix:** Add:
  ```json
  "noUncheckedIndexedAccess": true,
  "noImplicitReturns": true,
  "noFallthroughCasesInSwitch": true
  ```

## D-03: Expand ESLint rules
- **File:** `eslint.config.mjs`
- **Issue:** Only `next/core-web-vitals` and `next/typescript` — very minimal
- **Fix:** Add rules for:
  - `no-console: "warn"` (there are 4 production `console.error`/`console.warn` calls)
  - `@typescript-eslint/consistent-type-imports: "error"`
  - `import/order` (organize imports)

## D-04: ✓ Fix package name
- **File:** `package.json:2`
- **Issue:** `"name": "temp-app"` — placeholder name
- **Fix:** Change to `"slnews"`

## D-05: Add PWA build awareness note
- **File:** `next.config.ts:4-8`
- **Issue:** `@ducanh2912/next-pwa` can cause HMR issues in dev (already disabled: `disable: NODE_ENV === "development"`). Document this for developers.
- **Fix:** Add comment in `next.config.ts` explaining the HMR/PWA tradeoff

## D-06: ✓ Add VS Code settings
- **File:** `.vscode/settings.json`
- **Fix:** Created with formatOnSave, Prettier, ESLint auto-fix, TypeScript workspace SDK
- **File:** `.vscode/settings.json` (missing)
- **Fix:** Create with:
  ```json
  {
    "editor.formatOnSave": true,
    "editor.defaultFormatter": "esbenp.prettier-vscode",
    "editor.codeActionsOnSave": { "source.fixAll.eslint": true },
    "typescript.tsdk": "node_modules/typescript/lib",
    "typescript.enablePromptUseWorkspaceTsdk": true
  }
  ```

## D-07: ✓ Add Node.js version pinning
- **File:** `.nvmrc` or `.node-version` (missing)
- **Fix:** Create `.nvmrc` with current Node version (e.g., `20` or `22`)

## D-08: ✓ Add Prettier config
- **File:** `.prettierrc` (missing)
- **Issue:** No formatting config — code style consistency depends on ESLint alone
- **Fix:** Create `.prettierrc` with basic config:
  ```json
  { "semi": true, "singleQuote": false, "tabWidth": 2, "trailingComma": "es5" }
  ```

## D-09: Handle fetch errors gracefully
- **File:** `src/app/home/_components/PersonalizedFeed.tsx:24`
- **Issue:** `console.error` swallows fetch errors — user sees loading/empty state
- **Fix:** Add error state with retry button

## D-10: Disabled button cursor
- **File:** `src/app/dashboard/_components/DashboardClient.tsx`
- **Issue:** Disabled buttons still show `cursor-pointer` — should be `cursor-not-allowed`
- **Fix:** Add `disabled:cursor-not-allowed` to all disabled buttons
