import {
  FetchRequestAdapter,
  KiotaClientFactory,
} from "@microsoft/kiota-http-fetchlibrary";
import {
  AnonymousAuthenticationProvider,
  ParseNodeFactoryRegistry,
  SerializationWriterFactoryRegistry,
} from "@microsoft/kiota-abstractions";
import {
  JsonParseNodeFactory,
  JsonSerializationWriterFactory,
} from "@microsoft/kiota-serialization-json";

import { fetchWithGatewayErrorsNormalized } from "../../utils/gatewayErrorUtil";
import { createBackendApiClient } from "./backendApiClient";

export const useApiClient = () => {
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
  // The default middlewares stay; only the fetch underneath them is wrapped.
  const adapter = new FetchRequestAdapter(
    authProvider,
    parseRegistry,
    writerRegistry,
    KiotaClientFactory.create(fetchWithGatewayErrorsNormalized),
  );
  adapter.baseUrl = '/api';

  // Create the API client
  const client = createBackendApiClient(adapter);

  return client;
};
