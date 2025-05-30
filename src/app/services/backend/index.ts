import { FetchRequestAdapter } from "@microsoft/kiota-http-fetchlibrary";
import {
  AnonymousAuthenticationProvider,
  ParseNodeFactoryRegistry,
  SerializationWriterFactoryRegistry,
} from "@microsoft/kiota-abstractions";
import {
  JsonParseNodeFactory,
  JsonSerializationWriterFactory,
} from "@microsoft/kiota-serialization-json";

import { createBackendApiClient } from "./backendApiClient";

export const useApiClient = () => {
  const config = useRuntimeConfig();

  // Create registry and register JSON support
  const parseRegistry = new ParseNodeFactoryRegistry();
  parseRegistry.contentTypeAssociatedFactories.set(
    "application/json",
    new JsonParseNodeFactory(),
  );

  const writerRegistry = new SerializationWriterFactoryRegistry();
  writerRegistry.contentTypeAssociatedFactories.set(
    "application/json",
    new JsonSerializationWriterFactory(),
  );

  // API requires no authentication, so use the anonymous
  // authentication provider
  const authProvider = new AnonymousAuthenticationProvider();
  // Create request adapter using the fetch-based implementation
  const adapter = new FetchRequestAdapter(
    authProvider,
    parseRegistry,
    writerRegistry,
  );
  adapter.baseUrl = `${config.public.apiBase}/api`;

  // Create the API client
  const client = createBackendApiClient(adapter);

  return client;
};
