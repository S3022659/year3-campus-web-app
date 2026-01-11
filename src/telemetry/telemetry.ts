import {
  ApplicationInsights,
  type ITelemetryItem,
  SeverityLevel,
} from '@microsoft/applicationinsights-web';

// Connection string preferred; instrumentation key retained for compatibility.
const connectionString = import.meta.env.VITE_APPINSIGHTS_CONNECTION_STRING as
  | string
  | undefined;
const instrumentationKey = import.meta.env
  .VITE_APPINSIGHTS_INSTRUMENTATION_KEY as string | undefined;

let appInsights: ApplicationInsights | null = null;

const withCommonProps = (
  props?: Record<string, string | number | boolean | undefined>,
) => ({ environment: import.meta.env.MODE, ...props });

export function initTelemetry() {
  if (appInsights || (!connectionString && !instrumentationKey)) {
    return;
  }

  appInsights = new ApplicationInsights({
    config: {
      connectionString,
      instrumentationKey,
      enableAutoRouteTracking: false,
      enableCorsCorrelation: true,
      enableRequestHeaderTracking: true,
      enableResponseHeaderTracking: true,
      disableFetchTracking: false,
      disableAjaxTracking: false,
      samplingPercentage: 100,
    },
  });

  appInsights.loadAppInsights();
}

export function trackPageView(name: string, uri?: string) {
  if (!appInsights) return;
  appInsights.trackPageView({ name, uri, ...withCommonProps() });
}

export function trackEvent(
  name: string,
  properties?: Record<string, string | number | boolean | undefined>,
) {
  if (!appInsights) return;
  appInsights.trackEvent({ name }, withCommonProps(properties));
}

export function trackError(error: unknown, context?: Record<string, unknown>) {
  if (!appInsights) return;
  const err = error instanceof Error ? error : new Error(String(error));
  appInsights.trackException(
    {
      exception: err,
      severityLevel: SeverityLevel.Error,
    },
    withCommonProps(
      context as Record<string, string | number | boolean | undefined>,
    ),
  );
}

export function addTelemetryInitializer(
  initializer: (item: ITelemetryItem) => boolean | void,
) {
  if (!appInsights) return;
  appInsights.addTelemetryInitializer(initializer);
}
