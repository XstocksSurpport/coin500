"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  createChart,
  ColorType,
  CandlestickSeries,
  HistogramSeries,
  CrosshairMode,
  type IChartApi,
  type ISeriesApi,
  type UTCTimestamp,
} from "lightweight-charts";
import type { Instrument } from "@/lib/types";
import { formatPrice } from "@/lib/format";
import { fetchCandles, type ChartInterval } from "@/lib/chart";

const TIMEFRAMES: { label: string; value: ChartInterval }[] = [
  { label: "1m", value: "1m" },
  { label: "5m", value: "5m" },
  { label: "15m", value: "15m" },
  { label: "1H", value: "1h" },
  { label: "4H", value: "4h" },
  { label: "1D", value: "1d" },
  { label: "1W", value: "1w" },
];

interface ChartPanelProps {
  instrument: Instrument | null;
  market: "primary" | "secondary";
  onTrade: () => void;
}

export function ChartPanel({ instrument, market, onTrade }: ChartPanelProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const candleRef = useRef<ISeriesApi<"Candlestick"> | null>(null);
  const volumeRef = useRef<ISeriesApi<"Histogram"> | null>(null);
  const priceLineRef = useRef<ReturnType<
    ISeriesApi<"Candlestick">["createPriceLine"]
  > | null>(null);

  const [interval, setInterval] = useState<ChartInterval>("1h");
  const [chartReady, setChartReady] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ohlc, setOhlc] = useState<{
    o: number;
    h: number;
    l: number;
    c: number;
  } | null>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const chart = createChart(el, {
      autoSize: true,
      layout: {
        background: { type: ColorType.Solid, color: "#ffffff" },
        textColor: "#6b7280",
        fontFamily: "inherit",
      },
      grid: {
        vertLines: { color: "#f0f3f7" },
        horzLines: { color: "#f0f3f7" },
      },
      rightPriceScale: {
        borderColor: "#e5e9ef",
        scaleMargins: { top: 0.08, bottom: 0.22 },
      },
      timeScale: {
        borderColor: "#e5e9ef",
        timeVisible: true,
        secondsVisible: interval === "1m" || interval === "5m",
      },
      crosshair: { mode: CrosshairMode.Normal },
    });

    const candles = chart.addSeries(CandlestickSeries, {
      upColor: "#00a651",
      downColor: "#e53935",
      borderVisible: false,
      wickUpColor: "#00a651",
      wickDownColor: "#e53935",
    });

    const volume = chart.addSeries(HistogramSeries, {
      priceFormat: { type: "volume" },
      priceScaleId: "volume",
    });

    chart.priceScale("volume").applyOptions({
      scaleMargins: { top: 0.82, bottom: 0 },
    });

    chartRef.current = chart;
    candleRef.current = candles;
    volumeRef.current = volume;
    setChartReady(true);

    chart.subscribeCrosshairMove((param) => {
      const data = param.seriesData.get(candles);
      if (data && "open" in data) {
        setOhlc({
          o: data.open,
          h: data.high,
          l: data.low,
          c: data.close,
        });
      }
    });

    return () => {
      chart.remove();
      chartRef.current = null;
      candleRef.current = null;
      volumeRef.current = null;
      priceLineRef.current = null;
      setChartReady(false);
    };
  }, []);

  useEffect(() => {
    chartRef.current?.applyOptions({
      timeScale: {
        secondsVisible: interval === "1m" || interval === "5m",
      },
    });
  }, [interval]);

  const loadCandles = useCallback(async () => {
    if (!instrument || !chartReady || !candleRef.current || !volumeRef.current) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const candles = await fetchCandles(instrument, market, interval);
      if (!candles.length) {
        setError("\u6682\u65e0 K \u7ebf\u6570\u636e");
        return;
      }

      const candleData = candles.map((c) => ({
        time: c.time as UTCTimestamp,
        open: c.open,
        high: c.high,
        low: c.low,
        close: c.close,
      }));

      const volumeData = candles.map((c) => ({
        time: c.time as UTCTimestamp,
        value: c.volume ?? 0,
        color:
          c.close >= c.open
            ? "rgba(0, 166, 81, 0.35)"
            : "rgba(229, 57, 53, 0.35)",
      }));

      candleRef.current.setData(candleData);
      volumeRef.current.setData(volumeData);

      const last = candles[candles.length - 1];
      setOhlc({ o: last.open, h: last.high, l: last.low, c: last.close });

      if (priceLineRef.current) {
        candleRef.current.removePriceLine(priceLineRef.current);
      }
      priceLineRef.current = candleRef.current.createPriceLine({
        price: instrument.price,
        color: "#0051ff",
        lineWidth: 1,
        lineStyle: 2,
        axisLabelVisible: true,
        title: "",
      });

      chartRef.current?.timeScale().fitContent();
    } catch {
      setError("\u52a0\u8f7d\u5931\u8d25");
    } finally {
      setLoading(false);
    }
  }, [instrument, market, interval, chartReady]);

  useEffect(() => {
    loadCandles();
    const t = window.setInterval(loadCandles, 30000);
    return () => clearInterval(t);
  }, [loadCandles]);

  const display = instrument
    ? (ohlc ?? {
        o: instrument.price,
        h: instrument.high24h,
        l: instrument.low24h,
        c: instrument.price,
      })
    : null;

  return (
    <div className="flex h-full min-h-[320px] flex-col overflow-hidden rounded-xl border border-[#e5e9ef] bg-white shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#e8ecf1] px-3 py-2">
        {instrument ? (
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <span className="font-semibold text-[#1f2937]">{instrument.symbol}</span>
            <span
              className={`text-sm font-medium ${
                instrument.change24h >= 0 ? "text-[#00a651]" : "text-[#e53935]"
              }`}
            >
              {instrument.change24h >= 0 ? "+" : ""}
              {instrument.change24h.toFixed(2)}%
            </span>
            {display && (
              <span className="font-mono text-xs text-[#6b7280]">
                O {formatPrice(display.o, market)} H{" "}
                {formatPrice(display.h, market)} L {formatPrice(display.l, market)}{" "}
                C {formatPrice(display.c, market)}
              </span>
            )}
            {loading && (
              <span className="text-xs text-[#9ca3af]">{"\u5237\u65b0\u4e2d"}</span>
            )}
            {error && <span className="text-xs text-[#e53935]">{error}</span>}
          </div>
        ) : (
          <span className="text-sm text-[#9ca3af]">{"\u9009\u62e9\u6807\u7684"}</span>
        )}
        <div className="flex flex-wrap gap-1">
          {TIMEFRAMES.map((tf) => (
            <button
              key={tf.value}
              type="button"
              disabled={!instrument}
              onClick={() => setInterval(tf.value)}
              className={`rounded px-2 py-1 text-xs disabled:opacity-40 ${
                interval === tf.value
                  ? "bg-[#0051ff] text-white"
                  : "text-[#6b7280] hover:bg-[#f5f7f9]"
              }`}
            >
              {tf.label}
            </button>
          ))}
        </div>
      </div>

      <div className="relative min-h-[260px] flex-1">
        {!instrument && (
          <div className="pointer-events-none absolute inset-0 z-[5] flex items-center justify-center bg-white/80 text-sm text-[#9ca3af]">
            {"\u9009\u62e9\u6807\u7684\u67e5\u770b K \u7ebf"}
          </div>
        )}
        {instrument && (
          <div className="absolute left-3 top-3 z-10">
            <button
              type="button"
              onClick={onTrade}
            className="rounded-lg bg-[#0051ff] px-5 py-2.5 text-sm font-semibold text-white shadow-md hover:bg-[#0046dd]"
          >
            Agent{"\u4ea4\u6613"}
          </button>
          </div>
        )}
        <div ref={containerRef} className="absolute inset-0" />
      </div>
    </div>
  );
}
