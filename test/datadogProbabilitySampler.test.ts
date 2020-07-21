/*
 * Unless explicitly stated otherwise all files in this repository are licensed
 * under the Apache 2.0 license (see LICENSE).
 * This product includes software developed at Datadog (https://www.datadoghq.com/).
 * Copyright 2020 Datadog, Inc.
 */

import * as assert from 'assert';
import * as api from '@opentelemetry/api';
import {
  DatadogProbabilitySampler,
  DATADOG_ALWAYS_SAMPLER,
  DATADOG_NEVER_SAMPLER,
} from '../src';

describe('DatadogProbabilitySampler', () => {
  it('should return a DATADOG_ALWAYS_SAMPLER for 1', () => {
    const sampler = new DatadogProbabilitySampler(1);
    assert.deepStrictEqual(sampler.shouldSample(), {
      decision: api.SamplingDecision.RECORD_AND_SAMPLED,
    });
  });

  it('should return a DATADOG_ALWAYS_SAMPLER for >1', () => {
    const sampler = new DatadogProbabilitySampler(100);
    assert.deepStrictEqual(sampler.shouldSample(), {
      decision: api.SamplingDecision.RECORD_AND_SAMPLED,
    });
    assert.strictEqual(sampler.toString(), 'DatadogProbabilitySampler{1}');
  });

  it('should return a DATADOG_NEVER_SAMPLER for 0', () => {
    const sampler = new DatadogProbabilitySampler(0);
    assert.deepStrictEqual(sampler.shouldSample(), {
      decision: api.SamplingDecision.RECORD,
    });
  });

  it('should return a DATADOG_NEVER_SAMPLER for <0', () => {
    const sampler = new DatadogProbabilitySampler(-1);
    assert.deepStrictEqual(sampler.shouldSample(), {
      decision: api.SamplingDecision.RECORD,
    });
  });

  it('should sample according to the probability', () => {
    Math.random = () => 1 / 10;
    const sampler = new DatadogProbabilitySampler(0.2);
    assert.deepStrictEqual(sampler.shouldSample(), {
      decision: api.SamplingDecision.RECORD_AND_SAMPLED,
    });
    assert.strictEqual(sampler.toString(), 'DatadogProbabilitySampler{0.2}');

    Math.random = () => 5 / 10;
    assert.deepStrictEqual(sampler.shouldSample(), {
      decision: api.SamplingDecision.RECORD,
    });
  });

  it('should return api.SamplingDecision.RECORD_AND_SAMPLED for DATADOG_ALWAYS_SAMPLER', () => {
    assert.deepStrictEqual(DATADOG_ALWAYS_SAMPLER.shouldSample(), {
      decision: api.SamplingDecision.RECORD_AND_SAMPLED,
    });
    assert.strictEqual(
      DATADOG_ALWAYS_SAMPLER.toString(),
      'DatadogProbabilitySampler{1}'
    );
  });

  it('should return decision: api.SamplingDecision.RECORD for DATADOG_NEVER_SAMPLER', () => {
    assert.deepStrictEqual(DATADOG_NEVER_SAMPLER.shouldSample(), {
      decision: api.SamplingDecision.RECORD,
    });
    assert.strictEqual(
      DATADOG_NEVER_SAMPLER.toString(),
      'DatadogProbabilitySampler{0}'
    );
  });

  it('should handle NaN', () => {
    const sampler = new DatadogProbabilitySampler(NaN);
    assert.deepStrictEqual(sampler.shouldSample(), {
      decision: api.SamplingDecision.RECORD,
    });
    assert.strictEqual(sampler.toString(), 'DatadogProbabilitySampler{0}');
  });

  it('should handle -NaN', () => {
    const sampler = new DatadogProbabilitySampler(-NaN);
    assert.deepStrictEqual(sampler.shouldSample(), {
      decision: api.SamplingDecision.RECORD,
    });
    assert.strictEqual(sampler.toString(), 'DatadogProbabilitySampler{0}');
  });

  it('should handle undefined', () => {
    const sampler = new DatadogProbabilitySampler(undefined);
    assert.deepStrictEqual(sampler.shouldSample(), {
      decision: api.SamplingDecision.RECORD,
    });
    assert.strictEqual(sampler.toString(), 'DatadogProbabilitySampler{0}');
  });
});
