/*
 * Unless explicitly stated otherwise all files in this repository are licensed
 * under the Apache 2.0 license (see LICENSE).
 * This product includes software developed at Datadog (https://www.datadoghq.com/).
 * Copyright 2020 Datadog, Inc.
 */

import {
  defaultTextMapGetter,
  defaultTextMapSetter,
  SpanContext,
  TraceFlags,
  ROOT_CONTEXT,
  setSpanContext,
  getSpanContext,
} from '@opentelemetry/api';
import * as assert from 'assert';
import { TraceState } from '@opentelemetry/core';
import { DatadogPropagator } from '../src/';
import { id } from '../src/types';
import { DatadogPropagationDefaults } from '../src/defaults';

describe('DatadogPropagator', () => {
  const datadogPropagator = new DatadogPropagator();
  let carrier: { [key: string]: unknown };

  beforeEach(() => {
    carrier = {};
  });

  describe('.inject()', () => {
    it('should set datadog traceId and spanId headers', () => {
      const traceId = 'd4cda95b652f4a1592b449d5929fda1b';
      const spanId = '6e0c63257de34c92';
      const spanContext: SpanContext = {
        traceId: traceId,
        spanId: spanId,
        traceFlags: TraceFlags.SAMPLED,
      };

      datadogPropagator.inject(
        setSpanContext(ROOT_CONTEXT, spanContext),
        carrier,
        defaultTextMapSetter
      );
      assert.deepStrictEqual(
        carrier[DatadogPropagationDefaults.X_DD_TRACE_ID],
        id(traceId).toString(10)
      );
      assert.deepStrictEqual(
        carrier[DatadogPropagationDefaults.X_DD_PARENT_ID],
        id(spanId).toString(10)
      );
      assert.deepStrictEqual(
        carrier[DatadogPropagationDefaults.X_DD_SAMPLING_PRIORITY],
        '1'
      );
    });

    it('should set b3 traceId and spanId headers and also traceflags and tracestate', () => {
      const traceId = 'd4cda95b652f4a1592b449d5929fda1b';
      const spanId = '6e0c63257de34c92';
      const spanContext: SpanContext = {
        traceId: traceId,
        spanId: spanId,
        traceFlags: TraceFlags.NONE,
        traceState: new TraceState('dd_origin=synthetics-example'),
        isRemote: true,
      };

      datadogPropagator.inject(
        setSpanContext(ROOT_CONTEXT, spanContext),
        carrier,
        defaultTextMapSetter
      );
      assert.deepStrictEqual(
        carrier[DatadogPropagationDefaults.X_DD_TRACE_ID],
        id(traceId).toString(10)
      );
      assert.deepStrictEqual(
        carrier[DatadogPropagationDefaults.X_DD_PARENT_ID],
        id(spanId).toString(10)
      );
      assert.deepStrictEqual(
        carrier[DatadogPropagationDefaults.X_DD_SAMPLING_PRIORITY],
        '0'
      );
      assert.deepStrictEqual(
        carrier[DatadogPropagationDefaults.X_DD_ORIGIN],
        'synthetics-example'
      );
    });

    it('should not inject empty spancontext', () => {
      const emptySpanContext = {
        traceId: '',
        spanId: '',
        traceFlags: TraceFlags.NONE,
      };
      datadogPropagator.inject(
        setSpanContext(ROOT_CONTEXT, emptySpanContext),
        carrier,
        defaultTextMapSetter
      );
      assert.deepStrictEqual(
        carrier[DatadogPropagationDefaults.X_DD_TRACE_ID],
        undefined
      );
      assert.deepStrictEqual(
        carrier[DatadogPropagationDefaults.X_DD_PARENT_ID],
        undefined
      );
    });
  });

  describe('.extract()', () => {
    it('should extract context of a unsampled span from carrier', () => {
      carrier[DatadogPropagationDefaults.X_DD_TRACE_ID] = id(
        '0af7651916cd43dd8448eb211c80319c'
      ).toString(10);
      carrier[DatadogPropagationDefaults.X_DD_PARENT_ID] = id(
        'b7ad6b7169203331'
      ).toString(10);
      const extractedSpanContext = getSpanContext(
        datadogPropagator.extract(ROOT_CONTEXT, carrier, defaultTextMapGetter)
      );

      assert.deepStrictEqual(extractedSpanContext, {
        spanId: 'b7ad6b7169203331',
        traceId: '0af7651916cd43dd',
        isRemote: true,
        traceFlags: TraceFlags.NONE,
      });
    });

    it('should extract context of a sampled span from carrier', () => {
      carrier[DatadogPropagationDefaults.X_DD_TRACE_ID] = id(
        '0af7651916cd43dd8448eb211c80319c'
      ).toString(10);
      carrier[DatadogPropagationDefaults.X_DD_PARENT_ID] = id(
        'b7ad6b7169203331'
      ).toString(10);
      carrier[DatadogPropagationDefaults.X_DD_SAMPLING_PRIORITY] = '1';

      const extractedSpanContext = getSpanContext(
        datadogPropagator.extract(ROOT_CONTEXT, carrier, defaultTextMapGetter)
      );

      assert.deepStrictEqual(extractedSpanContext, {
        spanId: 'b7ad6b7169203331',
        traceId: '0af7651916cd43dd',
        isRemote: true,
        traceFlags: TraceFlags.SAMPLED,
      });
    });

    it('should return undefined when traceId is undefined', () => {
      carrier[DatadogPropagationDefaults.X_DD_TRACE_ID] = undefined;
      carrier[DatadogPropagationDefaults.X_DD_PARENT_ID] = undefined;
      assert.deepStrictEqual(
        getSpanContext(
          datadogPropagator.extract(ROOT_CONTEXT, carrier, defaultTextMapGetter)
        ),
        undefined
      );
    });

    it('should return undefined when options and spanId are undefined', () => {
      carrier[DatadogPropagationDefaults.X_DD_TRACE_ID] = id(
        '0af7651916cd43dd8448eb211c80319c'
      ).toString(10);
      carrier[DatadogPropagationDefaults.X_DD_PARENT_ID] = undefined;
      assert.deepStrictEqual(
        getSpanContext(
          datadogPropagator.extract(ROOT_CONTEXT, carrier, defaultTextMapGetter)
        ),
        undefined
      );
    });

    it('returns undefined if datadog header is missing', () => {
      assert.deepStrictEqual(
        getSpanContext(
          datadogPropagator.extract(ROOT_CONTEXT, carrier, defaultTextMapGetter)
        ),
        undefined
      );
    });

    it('returns undefined if datadog header is invalid', () => {
      carrier[DatadogPropagationDefaults.X_DD_TRACE_ID] = 'invalid!';
      assert.deepStrictEqual(
        getSpanContext(
          datadogPropagator.extract(ROOT_CONTEXT, carrier, defaultTextMapGetter)
        ),
        undefined
      );
    });

    it('extracts datadog from list of header', () => {
      carrier[DatadogPropagationDefaults.X_DD_TRACE_ID] = [
        id('0af7651916cd43dd8448eb211c80319c').toString(10),
      ];
      carrier[DatadogPropagationDefaults.X_DD_PARENT_ID] = id(
        'b7ad6b7169203331'
      ).toString(10);
      carrier[DatadogPropagationDefaults.X_DD_SAMPLING_PRIORITY] = '01';
      const extractedSpanContext = getSpanContext(
        datadogPropagator.extract(ROOT_CONTEXT, carrier, defaultTextMapGetter)
      );

      assert.deepStrictEqual(extractedSpanContext, {
        spanId: 'b7ad6b7169203331',
        traceId: '0af7651916cd43dd',
        isRemote: true,
        traceFlags: TraceFlags.SAMPLED,
      });
    });

    it('should fail gracefully on bad responses from getter', () => {
      const ctx1 = datadogPropagator.extract(ROOT_CONTEXT, carrier, {
        // @ts-expect-error verify number is not allowed
        get: (c, k) => 1, // not a number
        keys: defaultTextMapGetter.keys,
      });
      const ctx2 = datadogPropagator.extract(ROOT_CONTEXT, carrier, {
        get: (c, k) => [], // empty array
        keys: defaultTextMapGetter.keys,
      });
      const ctx3 = datadogPropagator.extract(ROOT_CONTEXT, carrier, {
        get: (c, k) => undefined, // missing value
        keys: defaultTextMapGetter.keys,
      });

      assert.ok(ctx1 === ROOT_CONTEXT);
      assert.ok(ctx2 === ROOT_CONTEXT);
      assert.ok(ctx3 === ROOT_CONTEXT);
    });

    // TODO: this is implemented for b3 64 bit, not sure if we should implement for datadog
    //   it('should left-pad 64 bit trace ids with 0', () => {
    //   });
  });
});
