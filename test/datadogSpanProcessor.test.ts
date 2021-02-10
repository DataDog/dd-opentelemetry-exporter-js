/*
 * Unless explicitly stated otherwise all files in this repository are licensed
 * under the Apache 2.0 license (see LICENSE).
 * This product includes software developed at Datadog (https://www.datadoghq.com/).
 * Copyright 2020 Datadog, Inc.
 */

import { TraceFlags, setSpanContext, ROOT_CONTEXT } from '@opentelemetry/api';
import {
  InMemorySpanExporter,
  BasicTracerProvider,
  Span,
} from '@opentelemetry/tracing';
import * as assert from 'assert';
import * as sinon from 'sinon';
import { DatadogSpanProcessor, DATADOG_ALWAYS_SAMPLER } from '../src';

function createSampledSpan(spanName: string, parent?: boolean): Span {
  const tracer = new BasicTracerProvider({
    sampler: DATADOG_ALWAYS_SAMPLER,
  }).getTracer('default');
  const span = parent
    ? tracer.startSpan(
        spanName,
        {},
        setSpanContext(ROOT_CONTEXT, {
          traceId: 'd4cda95b652f4a1592b449d5929fda1b',
          spanId: '6e0c63257de34c92',
          traceFlags: TraceFlags.SAMPLED,
        })
      )
    : tracer.startSpan(spanName);

  span.end();

  return span as Span;
}

describe('DatadogSpanProcessor', () => {
  const name = 'span-name';
  const defaultProcessorConfig = {
    maxQueueSize: 10,
    maxTraceSize: 3,
    bufferTimeout: 3000,
  };
  let exporter: InMemorySpanExporter;
  beforeEach(() => {
    exporter = new InMemorySpanExporter();
  });
  afterEach(() => {
    exporter.reset();
    sinon.restore();
  });

  describe('constructor', () => {
    it('should create a DatadogSpanProcessor instance', () => {
      const processor = new DatadogSpanProcessor(exporter);
      assert.ok(processor instanceof DatadogSpanProcessor);
      processor.shutdown();
    });

    it('should create a DatadogSpanProcessor instance with config', () => {
      const processor = new DatadogSpanProcessor(
        exporter,
        defaultProcessorConfig
      );
      assert.ok(processor instanceof DatadogSpanProcessor);
      assert.strictEqual(processor['_maxQueueSize'], 10);
      assert.strictEqual(processor['_maxTraceSize'], 3);
      processor.shutdown();
    });

    it('should create a DatadogSpanProcessor instance with empty config', () => {
      const processor = new DatadogSpanProcessor(exporter, {});
      assert.ok(processor instanceof DatadogSpanProcessor);
      processor.shutdown();
    });
  });

  describe('.onStart/.onEnd/.shutdown', () => {
    it('should do nothing after processor is shutdown', () => {
      const processor = new DatadogSpanProcessor(
        exporter,
        defaultProcessorConfig
      );
      const spy: sinon.SinonSpy = sinon.spy(exporter, 'export') as any;
      const span = createSampledSpan(`${name}_0`);

      processor.onStart(span);
      processor.onEnd(span);
      assert.strictEqual(processor['_traces'].size, 1);

      return processor.forceFlush().then(() => {
        assert.strictEqual(exporter.getFinishedSpans().length, 1);

        processor.onStart(span);
        processor.onEnd(span);
        assert.strictEqual(processor['_traces'].size, 1);

        assert.strictEqual(spy.args.length, 1);
        return processor.shutdown().then(() => {
          assert.strictEqual(spy.args.length, 2);
          assert.strictEqual(exporter.getFinishedSpans().length, 0);

          processor.onStart(span);
          processor.onEnd(span);
          assert.strictEqual(spy.args.length, 2);
          assert.strictEqual(processor['_traces'].size, 0);
          assert.strictEqual(exporter.getFinishedSpans().length, 0);
        });
      });
    });

    it.skip('should reach but not exceed the max buffer size', () => {
      const exporter = new InMemorySpanExporter();
      const processor = new DatadogSpanProcessor(
        exporter,
        defaultProcessorConfig
      );
      const maxQueueSize = defaultProcessorConfig.maxQueueSize;
      const aboveMaxQueueSize = maxQueueSize + 1;
      for (let i = 0; i < aboveMaxQueueSize; i++) {
        const span = createSampledSpan(`${name}_${i}`);
        processor.onStart(span);
        assert.strictEqual(exporter.getFinishedSpans().length, 0);

        processor.onEnd(span);
        assert.strictEqual(exporter.getFinishedSpans().length, 0);
      }

      //export all traces
      return processor.forceFlush().then(() => {
        assert.strictEqual(exporter.getFinishedSpans().length, maxQueueSize);

        return processor.shutdown().then(() => {
          assert.strictEqual(exporter.getFinishedSpans().length, 0);
        });
      });
    });

    it('should reach but not exceed the max trace size', () => {
      const processor = new DatadogSpanProcessor(
        exporter,
        defaultProcessorConfig
      );
      const maxTraceSize = defaultProcessorConfig.maxTraceSize;
      const aboveMaxTraceSize = maxTraceSize + 1;

      for (let i = 0; i < aboveMaxTraceSize; i++) {
        const span = createSampledSpan(`${name}_${i}`, true);
        processor.onStart(span);
        assert.strictEqual(exporter.getFinishedSpans().length, 0);

        processor.onEnd(span);
        assert.strictEqual(exporter.getFinishedSpans().length, 0);
      }

      //export all traces
      return processor.forceFlush().then(() => {
        assert.strictEqual(exporter.getFinishedSpans().length, maxTraceSize);

        return processor.shutdown().then(() => {
          assert.strictEqual(exporter.getFinishedSpans().length, 0);
        });
      });
    });

    it.skip('should force flush on demand', () => {
      const processor = new DatadogSpanProcessor(
        exporter,
        defaultProcessorConfig
      );
      for (let i = 0; i < defaultProcessorConfig.maxQueueSize; i++) {
        const span = createSampledSpan(`${name}_${i}`);
        processor.onStart(span);
        processor.onEnd(span);
      }
      assert.strictEqual(exporter.getFinishedSpans().length, 0);
      return processor.forceFlush().then(() => {
        assert.strictEqual(
          exporter.getFinishedSpans().length,
          defaultProcessorConfig.maxQueueSize
        );
      });
    });

    it('should not export empty span lists', done => {
      const spy = sinon.spy(exporter, 'export');
      const clock = sinon.useFakeTimers();

      const tracer = new BasicTracerProvider({
        sampler: DATADOG_ALWAYS_SAMPLER,
      }).getTracer('default');
      const processor = new DatadogSpanProcessor(
        exporter,
        defaultProcessorConfig
      );

      // start but do not end spans
      for (let i = 0; i < defaultProcessorConfig.maxQueueSize; i++) {
        const span = tracer.startSpan('spanName');
        processor.onStart(span as Span);
      }

      setTimeout(() => {
        assert.strictEqual(exporter.getFinishedSpans().length, 0);
        // after the timeout, export should not have been called
        // because no spans are ended
        sinon.assert.notCalled(spy);
        done();
      }, defaultProcessorConfig.bufferTimeout + 2000);

      // no spans have been finished
      assert.strictEqual(exporter.getFinishedSpans().length, 0);
      clock.tick(defaultProcessorConfig.bufferTimeout + 2000);

      clock.restore();
    });
  });
});
