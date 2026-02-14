# Test Coverage Summary

This document lists the unit tests implemented for the SunSeeker frontend to meet course submission requirements.

## Running Tests

- **All tests:** `npm test`
- **With coverage report:** `npm run test:coverage`

## Test Suites

### 1. Login (`src/pages/__tests__/Login.test.tsx`)

| Test | Description |
|------|-------------|
| Renders login form correctly | Ensures username field, password field, Sign In button, and sign-up link are present |
| Shows an error message for invalid credentials | Submits wrong credentials and asserts error message is shown and no token is stored |
| Successfully logs in and stores the token | Submits valid credentials with "Keep me logged in", asserts `authService.login` is called and `localStorage` contains `authToken`, `refreshToken`, and `user` |
| Validates form fields before submission | Submits empty form and asserts "Username is required"; then username only and asserts "Password is required" |

### 2. Register (`src/pages/__tests__/Register.test.tsx`)

| Test | Description |
|------|-------------|
| Renders register form with all fields | Ensures username, email, password, confirm password, and Create Account button are present |
| Validates required fields and email format | Submits empty form and asserts required-fields error; then invalid email and asserts email-format error |

### 3. Profile (`src/pages/__tests__/Profile.test.tsx`)

| Test | Description |
|------|-------------|
| Renders user information correctly when logged in | With stored auth, asserts user name, email, and avatar are displayed |
| Fetches and displays user posts | Asserts `getPostsByUserId` is called with user id and post locations are rendered |
| Sends PATCH with updated name and avatar when Save is clicked | Opens edit modal, changes display name, clicks Save; asserts `authService.updateProfile` was called with user id and updated name/avatar |
| Shows a message if the user has no posts | Mocks empty posts and asserts "You haven't posted any sunrises yet" is shown |
| Displays a login prompt if the user is not authenticated | With no user, asserts "Please log in to view your profile" is shown |

### 4. Home / Main Feed (`src/pages/__tests__/Home.test.tsx`)

| Test | Description |
|------|-------------|
| Renders 10 posts from a mocked API response | Mocks `getFeed(1)` to return 10 posts; asserts all 10 locations appear in the DOM |
| Loads more posts when Load more is clicked | Mocks two pages; clicks "Load more" and asserts second page is fetched and "You've reached the end" appears |
| Allows an author to delete their own post | Renders feed with current user's post; clicks Delete, confirms; asserts `deletePost` is called and post is removed from the list |

### 5. FeedCard / Interactions (`src/components/feed/__tests__/FeedCard.test.tsx`)

| Test | Description |
|------|-------------|
| Opens comments view when comment button is clicked | Clicks the Comments button and asserts the Comments dialog/heading is visible |

## API and Services

- **Auth:** `authService` is mocked in Login and Profile tests. Token storage is asserted in the Login test.
- **Posts:** `postService.getFeed`, `getPostsByUserId`, `deletePost`, `getComments` are mocked where needed. Integration with the real service is exercised in the app at runtime with mock data (in-memory store).

## Error Handling

- Login and Register display validation and API error messages.
- Profile edit modal shows save errors.
- Home displays a feed load error message.
- Upload displays validation and publish errors.
- A global `ErrorBoundary` shows "Something went wrong" and a "Try again" button if a component throws.

## Production Build

- `npm run build` runs TypeScript check and Vite build.
- Production build strips `console` and `debugger` via `vite.config.ts` (`esbuild.drop`).
