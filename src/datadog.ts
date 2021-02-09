/*
 * Unless explicitly stated otherwise all files in this repository are licensed
 * under the Apache 2.0 license (see LICENSE).
 * This product includes software developed at Datadog (https://www.datadoghq.com/).
 * Copyright 2020 Datadog, Inc.
 */

import * as api from '@opentelemetry/api';
import { ExportResult, ExportResultCode, NoopLogger } from '@opentelemetry/core';
import { ReadableSpan, SpanExporter } from '@opentelemetry/tracing';
import { translateToDatadog } from './transform';
import { AgentExporter, PrioritySampler, DatadogExporterConfig } from './types';
import { URL } from 'url';
import { DatadogExportDefaults } from './defaults';

/**
 * Format and sends span information to Datadog Exporter.
 */
export class DatadogExporter implements SpanExporter {
  private readonly _logger: api.Logger;
  private readonly _exporter: typeof AgentExporter;
  private _serviceName: string;
  private _env: string | undefined;
  private _version: string | undefined;
  private _tags: string | undefined;
  private _url: string;
  private _flushInterval: number;
  private _isShutdown: boolean;

  constructor(config: DatadogExporterConfig = {}) {
    this._url =
      config.agentUrl ||
      process.env.DD_TRACE_AGENT_URL ||
      DatadogExportDefaults.AGENT_URL;
    this._logger = config.logger || new NoopLogger();
    this._serviceName =
      config.serviceName ||
      process.env.DD_SERVICE ||
      DatadogExportDefaults.SERVICE_NAME;
    this._env = config.env || process.env.DD_ENV;

    this._version = config.version || process.env.DD_VERSION;
    this._tags = config.tags || process.env.DD_TAGS;
    this._flushInterval =
      config.flushInterval || DatadogExportDefaults.FLUSH_INTERVAL;
    this._exporter = new AgentExporter(
      { url: new URL(this._url), flushInterval: this._flushInterval },
      new PrioritySampler()
    );
    this._isShutdown = false;
  }

  /**
   * Called to export sampled {@link ReadableSpan}s.
   * @param spans the list of sampled Spans to be exported.
   */
  export(
    spans: ReadableSpan[],
    resultCallback: (result: ExportResult) => void
  ): void {
    if (this._isShutdown) {
      setTimeout(() =>
        resultCallback({
          code: ExportResultCode.FAILED,
          error: new Error('Exporter has been shutdown'),
        })
      );
      return;
    }

    if (spans.length === 0) {
      return resultCallback(ExportResult.SUCCESS);
    }

    const formattedDatadogSpans = translateToDatadog(
      spans,
      this._serviceName,
      this._env,
      this._version,
      this._tags
    );

    try {
      this._exporter.export(formattedDatadogSpans);
      return resultCallback(ExportResult.SUCCESS);
    } catch (error) {
      this._logger.debug(error);
      return resultCallback(ExportResult.FAILED_NOT_RETRYABLE);
    }
  }

  /** Stops the exporter. */
  shutdown(): void {
    if (this._exporter._scheduler !== undefined) {
      this._exporter._scheduler.stop();
    }
  }
}
