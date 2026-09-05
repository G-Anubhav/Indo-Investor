import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import {
  getSupabaseConfig,
  SupabaseConfigurationError,
} from "../src/lib/supabase/config.js";
import { formatKycStatus } from "../src/lib/phase4/translations.js";

test("public Supabase configuration uses browser-inlineable environment access", async () => {
  const source = await readFile(new URL("../src/lib/supabase/config.js", import.meta.url), "utf8");
  assert.match(source, /process\.env\.NEXT_PUBLIC_SUPABASE_URL/);
  assert.match(source, /process\.env\.NEXT_PUBLIC_SUPABASE_ANON_KEY/);
  assert.doesNotMatch(source, /process\.env\s*\[/);
});

test("Supabase configuration validates and normalizes public values", () => {
  const previousUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const previousKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  try {
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://example.supabase.co/";
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "public-anon-key";
    assert.deepEqual(getSupabaseConfig(), {
      url: "https://example.supabase.co",
      anonKey: "public-anon-key",
    });

    delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    assert.throws(() => getSupabaseConfig(), SupabaseConfigurationError);
  } finally {
    if (previousUrl === undefined) delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    else process.env.NEXT_PUBLIC_SUPABASE_URL = previousUrl;
    if (previousKey === undefined) delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    else process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = previousKey;
  }
});

test("KYC draft state is presented as an in-progress submission", () => {
  assert.equal(formatKycStatus("draft"), "In progress");
  assert.equal(formatKycStatus("pending_review"), "Under review");
  assert.equal(formatKycStatus(undefined), "Not started");
});
