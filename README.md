# Bubbi Cafe

A local development app for a co-parenting family, with React 19, Vite, Express, and MongoDB/Mongoose. The child experience is designed around Julian starting at age seven.

## Start

```sh
npm install
cp .env.example .env
# Set MONGODB_URI in .env to a running local MongoDB or MongoDB Atlas database.
npm run server
# In a second terminal:
npm run dev
```

Open the Vite URL printed in your terminal. Vite proxies `/api` to the local API on port 3001. `npm run build` builds the frontend; `npm run lint` checks the code. Vite preview does not proxy the API; use the development server for full-stack local use.

Without the API/database, the interface runs in clearly labeled demo mode. Demo data, edits, and uploads last only until refresh. It never reports a successful emergency delivery when services are unavailable. When connecting the API, MongoDB becomes the data source and replaces demo edits.

## Included

- Dedicated Mom, Dad, and Julian navigation spaces; responsive layouts and larger child controls.
- Shared monthly calendar and schedule form; overlapping time ranges are flagged. Connected clients refresh every 15 seconds. Revision checks prevent silent overwriting when both parents save. Calendar export creates an `.ics` file.
- Shared wishlist with each parent's approval vote and editable funding commitments after both approve. These are pledges, not payments.
- Birthday, allergies, diet, health, behavior, medical, dental, and vision records; three name/phone/email contact slots per parent.
- Parent photo and document uploads, shared photo carousel, and dashboard photo thumbnails. Connected uploads live in `server/uploads`; MongoDB stores their metadata. Allowed types: PDF, plain text, JPEG, PNG, WebP; maximum 10 MB. Removing a record does not delete its disk file.
- AI Learning Time researches a parent-provided topic and optional teaching notes, then creates concept-based quizzes, sorting, matching, and sequencing games. Each teaches the concept, provides hints, and explains answers. Parents preview and approve activities for the library. Repeat requests rotate formats using recent activity history. Four clearly labeled ocean sample activities work without AI credentials.
- Interactive aquarium on the Squid & octopus tab: eight sea animal choices, swimming and snack-following behavior, names, removal, pause, reset, and a 20-animal capacity. The animal picker moves below the tank on small screens. This pretend tank resets when leaving the tab and is not stored in MongoDB. Reduced-motion users start with the tank paused.
- Squid & octopus tab with five curated direct YouTube video links, thumbnails, animal/documentary filters, and discussion prompts. Available in Julian’s space and the parents’ child-area navigation. Publisher links were checked on October 11, 2026; playback remains on YouTube.
- Randomized memory game with 4, 6, or 8 pairs and an addition game with numbers from 1 to 10.
- Explicit emergency submission to SMTP email and Twilio SMS when all provider settings exist. Both parents' configured numbers/emails can be comma-separated. Contact form records are not automatically used as emergency recipients. Requests report provider acceptance or partial failure, not confirmed delivery. A 30-second local process cooldown reduces duplicate sends.

## Bubbi’s arcade

Play opens a cabinet-style arcade with category filters, favorite hearts, random game selection, per-session best scores, instructions, and replay controls. There are **12 new games plus the two existing games (14 total)**. No external game embeds, downloads, accounts, or paid services are needed.

| Game | How to play |
| --- | --- |
| Duck Hunt | Tag 12 flying duck targets by tapping or aiming with arrows and Space. |
| Bubbi Jump | An original side-scrolling platform adventure: jump gaps, collect coins, reach the flag. |
| Turbo Lanes | Steer around road cones and finish a 40-second race. |
| Dream Garage | Customize body, wheels, and paint, then drive through a flag-collection course. |
| Block City | Place roads, houses, and parks on a neighborhood grid; undo and erase work. |
| Sky Stacker | Time moving blocks and stack ten floors, with overlap affecting block width. |
| Bubble Party | Pop 20 floating bubbles in a timed round. |
| Star Catcher | Fly a spaceship, catch stars, and avoid meteors. |
| Treasure Trails | Navigate a newly generated connected maze to a treasure. |
| Rainbow Beats | Watch and repeat increasingly long color/symbol patterns. |
| Cosmic Breaker | Move a paddle to bounce the ball and clear 24 bricks. |
| Magnet Fishing | Drop and retrieve a magnet to collect eight moving treasures. |
| Memory Reef | The existing memory game, refreshed with sea animals and 4/6/8 pair options. |
| Number Rocket | The existing addition game, now with tap answers and a ten-star goal. |

Action games run in an original canvas engine with keyboard and touch buttons, pause/resume, and automatic pause when the browser tab is hidden. Puzzles and building games use accessible DOM controls. Animation-heavy games can be paused; decorative hover motion respects reduced-motion preferences. Arcade favorites and best scores are held in memory for the current Play-tab session, not persisted in MongoDB. All game art uses original shapes and system emoji; the platform game does not use Mario characters or assets.

`src/data/arcade.js` defines the catalog. `src/components/arcade` separates the game interfaces. `src/games/arcadeEngine.js` contains action rules, `drawArcade.js` renders scenes, and `puzzleRules.js` contains maze/stack/building rules. Run `node --test server/tests/arcade.test.js` for game-rule checks. Browser rendering and physical touch-device gameplay have not been verified in this environment.

## AI learning tutor

Set `OPENAI_API_KEY` in the server `.env` (never a `VITE_` variable), optionally set `OPENAI_MODEL` (default `gpt-4.1-mini`), then restart `npm run server`. No SDK dependency is needed; the server uses the OpenAI REST API. A key is required only for live generation; the four ocean examples remain playable without it.

From Mom or Dad → Learning Time, enter a topic and optional teaching notes. The agent moderates that input, searches educational sources using the Responses API web search tool, and creates a structured game in a separate model call. It validates answers and game structure, moderates the result, and returns the source links. Requests with unavailable sources, refusals, invalid answers, or provider errors fail without substituting fabricated content. The local server limits concurrent generation to two requests and six starts per minute. Each live generation uses two Responses calls and two moderation calls and can incur API/tool charges.

The four supported formats are multiple choice, category sorting, one-to-one matching, and ordered sequences. Recent formats and titles guide variation; the next request avoids the last three formats where possible. This is research plus generation of playable in-app games, not an external game directory or a guarantee that AI-generated facts are correct. Parent review remains useful. The agent is a bounded workflow rather than an autonomous general-purpose chat agent.

Parents can preview and approve a generated lesson; approved lesson content and sources are saved with the family record in MongoDB. Julian can play approved lessons and request another way to learn the same topic; these remixes are moderated and displayed immediately, but are not automatically added to the saved library. Format history survives navigation during the current app session, with saved lessons used as additional context after refresh. Answers and scores are graded locally; personal records, contacts, medical data, names, and scores are not sent by this integration. Keep teaching notes free of personal information. `store:false` disables Responses application storage; it does not itself establish Zero Data Retention. Before processing personal data of a child under 13, configure the provider’s required Zero Data Retention controls. The existing local-only authentication limitations still apply.

Tests: `node --test server/learning/agent.test.js`. These use a mock provider and check answer grading/validation, format rotation, source extraction, moderation/provider failures, and MongoDB schema compatibility. They do not make paid API calls or verify live educational quality. Live API generation and browser interactions have not been verified in this environment.

Implementation references: [Structured Outputs](https://developers.openai.com/api/docs/guides/structured-outputs?api-mode=responses), [web search](https://developers.openai.com/api/docs/guides/tools-web-search), [moderation](https://developers.openai.com/api/docs/guides/moderation), and [under-18 guidance](https://developers.openai.com/api/docs/guides/safety-checks/under-18-api-guidance).

## Interactive home experiences

Julian enters an illustrated adventure map instead of a dashboard. Four destinations open learning, the arcade, the aquarium/videos, and family memories. Five collectible relics, a compass guide with cycling tips, and a random destination add exploration. Relic progress survives page changes for the current session. Child navigation runs across the top with no dashboard sidebar.

Parents enter a family home centered on a shared photo story (or interactive garden), with inline dialogs for planning moments and proposing wishes. A conversation area browses plans and wishes one at a time and lets the active parent vote directly. Existing calendar, budgeting, records, and uploads remain available.

## Visual themes

Parent spaces use a restrained slate, white, and teal dashboard theme. Julian’s space uses slate, petrol blue, forest green, and copper with sharper typography, an expedition map, and restrained arcade and aquarium styling for an older kid. Parent styles are isolated in `src/themes.css` and child styles in `src/older-kid.css`; layout rules remain in `src/App.css`. Hover effects respect reduced-motion preferences.

## Structure

`src/components` holds shared navigation, icons, fields, modal, calendar grid, and emergency controls. `src/pages` holds feature areas. `src/hooks/useFamily.js` manages API loading, saves, polling, and demo state. `src/data/initial.js` contains demo records. `server/models.js` defines MongoDB schemas; `server/index.js` provides API and upload handling. Older Music/Shows placeholders are unused.

## Integration and production gaps

This is a **local development foundation**, bound to loopback. The Mom/Dad/Julian selector switches views; it is not authentication or authorization. Do not expose this server or enter real child medical records until parent authentication, server-enforced roles and family isolation, secure sessions, HTTPS, encrypted storage/backups, and private authorized file access are implemented. Environment credentials must remain server-side.

Google/Apple automatic calendar integration and push/browser notifications are not implemented. Calendar syncing here means app-to-app refresh, conflict alerts are in-app, and external calendars use a manual export. Automatic provider sync needs OAuth credentials, token storage, calendar subscriptions, and reconciliation. SMS and email need configured SMTP/Twilio accounts; they have not been tested against live providers. No external alerts are sent during setup or checks. This app is not an emergency response service.

Before deployment, uploads also need content-signature scanning, private object storage, lifecycle cleanup, and quotas. Emergency sending needs durable rate limits, authenticated authorization, verified recipients, delivery callbacks, and operational monitoring. Render configuration is included below.

## Shows

The Shows tab starts with Codename: Kids Next Door, Wild Kratts (the Kratt brothers), The Penguins of Madagascar, and Looney Tunes. Submit a character/show name or select a character chip to match the starter collection and create YouTube search links. Searches default to full episodes, with an option for clips. Wild Kratts links directly to the PBS KIDS video collection; other searches offer a PBS KIDS query on YouTube and a link to the PBS KIDS video library. Not all characters are PBS properties.

The curated Kids Next Door link opens Cartoon Network’s Operation: I.-S.C.R.E.A.M. full episode. All watch/search links open externally. This feature does not fetch live search results, guarantee full-episode availability, or filter YouTube results; queries include the publisher when recognized. No API credentials are required. Show metadata and search helpers live in `src/data/shows.js`, reusable cards in `src/components/ShowCard.jsx`, and the page in `src/pages/Shows.jsx`.

## Local insurance-card import

Vital Info includes structured insurance cards, masked member numbers with a reveal button, plan contacts, benefit tables, and source-card links. Cardholders and subscriber/dependent relationships are explicit; a subscriber card is not treated as confirmation of the child's coverage. Existing care notes and trusted contacts are preserved.

Personal card data is stored in ignored `server/private/vital-info.json`, with originals in `server/private/cards/`. These files are excluded from source control and the frontend bundle. The local API loads the import at startup. Run `npm run server` alongside `npm run dev` to display the local import even without MongoDB. Restart the API after changing the import file. With `MONGODB_URI` configured, the API imports into the existing family record once (preserving existing cards and edits), or seeds a new family record on first load. The import marker prevents repeat imports. Source-card links use an allowlist under `/api/vital-cards/`.

Without MongoDB, imported cards remain in the local file, while other edits follow the existing session-only demo behavior. This remains a localhost development app; the role switch is not authentication. Deployment requires parent authentication and authorization on the family API and card endpoints. Verify import behavior with `node --test server/tests/vitalImport.test.js`.

## Vital Info dashboard

Vital Info opens as read-only summary cards for birthday, allergies, diet, health, behavioral support, medical/dental/vision providers, trusted contacts, and insurance. Each field, contact slot, and insurance card has an Edit button that opens a focused dialog. Cancel discards the draft; Save updates the selected record while retaining other vital data. Insurance contacts, benefits, and source documents expand within each card. Native dialogs provide keyboard focus containment, Escape to cancel, and focus restoration. Session-only saves are labeled when MongoDB is disconnected.


## Deploy to Render

Push this `julian` repository to your Git provider. In Render, choose **New → Blueprint**, connect the repository, and use `render.yaml`. The blueprint assumes `package.json` is at the repository root. For a repository containing the outer folder, use `julian/render.yaml` as the blueprint path and add `rootDir: julian` to its service.

The blueprint creates a paid Starter web service and a 1 GB persistent disk. Review the displayed cost before creating it. Set `APP_USERNAME`, a strong unique `APP_PASSWORD`, and `MONGODB_URI` when prompted. Use a hosted MongoDB database and allow Render’s outbound IPs in its network settings.

For manual Web Service setup:

- Root directory: blank for this repository, or `julian` if deploying the outer repository.
- Build: `npm ci --include=dev && npm run build`
- Start: `npm start`
- Health check: `/api/health`
- Node version: `24.20.0`
- Environment: `NODE_ENV=production`, `APP_USERNAME`, `APP_PASSWORD`, `MONGODB_URI`, `UPLOAD_DIR=/var/data/uploads`.
- Persistent disk: mount at `/var/data` for photos and documents.

Express serves the frontend and API together on Render’s assigned port. The browser asks for the shared login. Missing production login credentials stop startup. Only `/api/health` is public; it checks the process and reports database status. A disconnected database uses the existing demo behavior.

Optional learning and emergency provider credentials are listed in `.env.example`; set these in Render’s Environment settings. Local `.env` files, local database records, and ignored private card files are not uploaded. Private card originals need a separate deliberate migration. Never commit secrets or private cards.

The shared login does not provide separate parent accounts or server-enforced Mom/Dad/Julian permissions. The production gaps above still apply before storing sensitive child records. Use Render’s HTTPS URL.
