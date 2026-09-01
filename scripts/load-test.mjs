#!/usr/bin/env node

import { performance } from "node:perf_hooks";

const DEFAULT_PATHS = ["/", "/comercios", "/categorias"];

const target = getArg("url") ?? "http://localhost:3000";
const durationSeconds = getNumberArg("duration", 30);
const concurrency = getNumberArg("concurrency", 10);
const paths = (getArg("paths") ?? DEFAULT_PATHS.join(","))
  .split(",")
  .map((path) => path.trim())
  .filter(Boolean);

const deadline = performance.now() + durationSeconds * 1000;
const latencies = [];
const statusCounts = new Map();
let completed = 0;
let failed = 0;

console.log(
  `Load testing ${target} for ${durationSeconds}s with concurrency ${concurrency}`,
);
console.log(`Paths: ${paths.join(", ")}`);

await Promise.all(
  Array.from({ length: concurrency }, (_, workerIndex) => runWorker(workerIndex)),
);

latencies.sort((a, b) => a - b);

const total = completed + failed;
const elapsedSeconds = durationSeconds;
const rps = total / elapsedSeconds;

console.log("\nResults");
console.log(`Total requests: ${total}`);
console.log(`Successful responses: ${completed}`);
console.log(`Failed requests: ${failed}`);
console.log(`Requests/sec: ${rps.toFixed(2)}`);
console.log(`p50: ${percentile(50).toFixed(0)} ms`);
console.log(`p95: ${percentile(95).toFixed(0)} ms`);
console.log(`p99: ${percentile(99).toFixed(0)} ms`);
console.log("Status codes:");

for (const [status, count] of [...statusCounts.entries()].sort()) {
  console.log(`  ${status}: ${count}`);
}

if (failed > 0 || [...statusCounts.keys()].some((status) => status >= 500)) {
  process.exitCode = 1;
}

async function runWorker(workerIndex) {
  let requestIndex = workerIndex;

  while (performance.now() < deadline) {
    const path = paths[requestIndex % paths.length];
    requestIndex += concurrency;
    await hit(path);
  }
}

async function hit(path) {
  const startedAt = performance.now();

  try {
    const response = await fetch(new URL(path, target), {
      headers: {
        "User-Agent": "compra-en-pereira-load-test/1.0",
      },
      redirect: "manual",
    });

    await response.arrayBuffer();

    const latency = performance.now() - startedAt;
    latencies.push(latency);
    completed += 1;
    statusCounts.set(response.status, (statusCounts.get(response.status) ?? 0) + 1);
  } catch {
    failed += 1;
  }
}

function percentile(value) {
  if (latencies.length === 0) {
    return 0;
  }

  const index = Math.min(
    latencies.length - 1,
    Math.ceil((value / 100) * latencies.length) - 1,
  );

  return latencies[index];
}

function getArg(name) {
  const prefix = `--${name}=`;
  const argument = process.argv.find((item) => item.startsWith(prefix));

  return argument?.slice(prefix.length);
}

function getNumberArg(name, fallback) {
  const rawValue = getArg(name);
  const value = rawValue ? Number(rawValue) : fallback;

  return Number.isFinite(value) && value > 0 ? value : fallback;
}
