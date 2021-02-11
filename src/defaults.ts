/*
 * Unless explicitly stated otherwise all files in this repository are licensed
 * under the Apache 2.0 license (see LICENSE).
 * This product includes software developed at Datadog (https://www.datadoghq.com/).
 * Copyright 2020 Datadog, Inc.
 */

export enum DatadogDefaults {
  /** The datadog formatted origin tag */
  DD_ORIGIN = '_dd_origin',

  /** The otel compliant formatted origin tag */
  OT_ALLOWED_DD_ORIGIN = 'dd_origin',

  /** The otel tracestate key */
  TRACE_STATE = 'traceState',

  /** The datadog formatted sample rate key */
  SAMPLE_RATE_METRIC_KEY = '_sample_rate',

  /** The otel attribute for error type */
  ERR_NAME_SUBSTRING = '.error_name',

  /** The datadog env tag */
  ENV_KEY = 'env',

  /** The datadog version tag */
  VERSION_KEY = 'version',

  /** The datadog error tag name */
  ERROR_TAG = 'error',

  /** A datadog error tag's value */
  ERROR = 1,

  /** The datadog error type tag name */
  ERROR_TYPE_TAG = 'error.type',

  /** A datadog error type's default value */
  ERROR_TYPE_DEFAULT_VALUE = 'ERROR',

  /** The datadog error message tag name */
  ERROR_MSG_TAG = 'error.msg',

  /** The datadog span kind tag name */
  SPAN_KIND = 'span.kind',

  /** The datadog span type tag name */
  SPAN_TYPE = 'span.type',

  /** The datadog resource tag name */
  RESOURCE_TAG = 'resource.name',

  /** The datadog service tag name */
  SERVICE_TAG = 'service.name',

  /** The datadog span kind client name */
  CLIENT = 'client',

  /** The datadog span kind server name */
  SERVER = 'server',

  /** The datadog span kind consumer name */
  PRODUCER = 'worker',

  /** The datadog span kind consumer name */
  CONSUMER = 'worker',

  /** The datadog span kind internal name */
  INTERNAL = 'internal',

  /** The otel traceId name */
  TRACE_ID = 'traceId',

  /** The otel spanId name */
  SPAN_ID = 'spanId',

  /** The otel http method attribute name */
  HTTP_METHOD = 'http.method',

  /** The otel http target attribute name */
  HTTP_TARGET = 'http.target',
}

export enum DatadogSamplingCodes {
  /** The datadog force drop value */
  USER_REJECT = -1,

  /** The datadog auto drop value */
  AUTO_REJECT = 0,

  /** The datadog auto keep value */
  AUTO_KEEP = 1,
}

export enum DatadogExportDefaults {
  /** The default service name. */
  SERVICE_NAME = 'dd-service',

  /** The default datadog agent url. */
  AGENT_URL = 'http://localhost:8126',

  /**
   * The default flush interval for the
   * Datadog exporter
   */
  FLUSH_INTERVAL = 1000,
}

export enum DatadogPropagationDefaults {
  /** The default datadog trace id header*/
  X_DD_TRACE_ID = 'x-datadog-trace-id',

  /** The default datadog parent span id header*/
  X_DD_PARENT_ID = 'x-datadog-parent-id',

  /** The default datadog sampling priority header*/
  X_DD_SAMPLING_PRIORITY = 'x-datadog-sampling-priority',

  /** The default datadog origin header*/
  X_DD_ORIGIN = 'x-datadog-origin',
}

// otel automatic instrumentation library names
export enum DatadogOtelInstrumentations {
  GRPC = '@opentelemetry/plugin-grpc',
  HTTP = '@opentelemetry/plugin-http',
  HTTPS = '@opentelemetry/plugin-https',
  EXPRESS = '@opentelemetry/plugin-express',
  IOREDIS = '@opentelemetry/plugin-ioredis',
  MONGODB = '@opentelemetry/plugin-mongodb',
  MYSQL = '@opentelemetry/plugin-mysql',
  PGPOOL = '@opentelemetry/plugin-pg-pool',
  PG = '@opentelemetry/plugin-pg',
  REDIS = '@opentelemetry/plugin-redis',
}

// datadog instrumentation library types
export enum DatadogInstrumentationTypes {
  WEB = 'web',
  HTTP = 'http',
  MONGODB = 'mongodb',
  REDIS = 'redis',
  SQL = 'sql',
}
