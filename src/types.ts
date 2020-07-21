/*
 * Unless explicitly stated otherwise all files in this repository are licensed
 * under the Apache 2.0 license (see LICENSE).
 * This product includes software developed at Datadog (https://www.datadoghq.com/).
 * Copyright 2020 Datadog, Inc.
 */

import * as api from '@opentelemetry/api';

/**
 * Datadog Exporter config
 */
export interface DatadogExporterConfig {
  tags?: string;
  logger?: api.Logger;
  serviceName?: string;
  agentUrl?: string;
  version?: string;
  env?: string;
  flushInterval?: number;
  // Optional mapping overrides for OpenTelemetry status code and description.
}

/** Interface configuration for a Datadog buffer. */
export interface DatadogBufferConfig {
  /** Maximum size of a buffer. */
  maxQueueSize?: number;
  maxTraceSize?: number;
  /** Max time for a buffer can wait before being sent */
  bufferTimeout?: number;
  logger?: api.Logger;
}

/* eslint-disable @typescript-eslint/no-var-requires */
export const id = require('dd-trace/packages/dd-trace/src/id');
export const SpanContext = require('dd-trace/packages/dd-trace/src/opentracing/span_context');
export const AgentExporter = require('dd-trace/packages/dd-trace/src/exporters/agent');
export const format = require('dd-trace/packages/dd-trace/src/format');
export const PrioritySampler = require('dd-trace/packages/dd-trace/src/priority_sampler');
export const Sampler = require('dd-trace/packages/dd-trace/src/sampler');
export const Span = require('dd-trace/packages/dd-trace/src/opentracing/span');
export const NoopTracer = require('dd-trace/packages/dd-trace/src/noop/tracer');
export const datadog = require('dd-trace');
/* eslint-enable @typescript-eslint/no-var-requires */
