# Test Setup

This project uses **Vitest** for unit testing Vue composables and application logic.

## Running Tests

```bash
# Run all tests
npm test

# Watch mode (re-run on file changes)
npm test -- --watch

# Run tests with UI dashboard
npm test:ui

# Generate coverage report
npm test:coverage
```

## Test Structure

- **Fake Repository Pattern**: Located in [src/test/fakeDeviceRepository.ts](../src/test/fakeDeviceRepository.ts), provides in-memory mock data for unit tests without hitting real APIs.
- **Composables Tests**: Located in [src/composables/useDevices.spec.ts](../src/composables/useDevices.spec.ts), tests the device fetching logic with various scenarios (success, errors, auth, loading states).

## Test Coverage

The test suite covers:

- **Happy path**: Successfully fetching devices
- **Error handling**: Network errors, HTTP error responses
- **Loading states**: Correct setting/clearing of loading flag
- **Concurrency**: Preventing multiple simultaneous requests
- **Authentication**: Including auth tokens in headers when authenticated
- **Token failures**: Gracefully degrading to unauthenticated requests
- **Data validation**: Handling invalid response formats
- **State cleanup**: Resetting error state on success after failure

Run `npm test:coverage` to see detailed coverage metrics.
