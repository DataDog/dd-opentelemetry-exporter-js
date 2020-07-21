/*
 * Unless explicitly stated otherwise all files in this repository are licensed
 * under the Apache 2.0 license (see LICENSE).
 * This product includes software developed at Datadog (https://www.datadoghq.com/).
 * Copyright 2020 Datadog, Inc.
 */

import {
  Sampler,
  SpanContext,
  TraceFlags,
  SamplingDecision,
} from '@opentelemetry/api';

/** Sampler that samples a given fraction of traces but records all traces. */
export class DatadogProbabilitySampler implements Sampler {
  constructor(private readonly _probability: number = 0) {
    this._probability = this._normalize(_probability);
  }

  shouldSample(parentContext?: SpanContext) {
    // Respect the parent sampling decision if there is one
    if (parentContext && typeof parentContext.traceFlags !== 'undefined') {
      return {
        decision:
          (TraceFlags.SAMPLED & parentContext.traceFlags) === TraceFlags.SAMPLED
            ? SamplingDecision.RECORD_AND_SAMPLED
            : SamplingDecision.RECORD,
      };
    }
    return {
      decision:
        Math.random() < this._probability
          ? SamplingDecision.RECORD_AND_SAMPLED
          : SamplingDecision.RECORD,
    };
  }

  toString(): string {
    // TODO: Consider to use `AlwaysSampleSampler` and `NeverSampleSampler`
    // based on the specs.
    return `DatadogProbabilitySampler{${this._probability}}`;
  }

  private _normalize(probability: number): number {
    if (typeof probability !== 'number' || isNaN(probability)) return 0;
    return probability >= 1 ? 1 : probability <= 0 ? 0 : probability;
  }
}

export const DATADOG_ALWAYS_SAMPLER = new DatadogProbabilitySampler(1);
export const DATADOG_NEVER_SAMPLER = new DatadogProbabilitySampler(0);
