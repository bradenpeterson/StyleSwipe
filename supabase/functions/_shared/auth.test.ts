import { assertEquals } from "jsr:@std/assert";
import { extractBearerToken } from "./auth.ts";

Deno.test("extractBearerToken returns token for valid Bearer header", () => {
  assertEquals(extractBearerToken("Bearer abc.def.ghi"), "abc.def.ghi");
});

Deno.test("extractBearerToken returns null for missing header", () => {
  assertEquals(extractBearerToken(null), null);
});

Deno.test("extractBearerToken returns null for non-bearer schemes", () => {
  assertEquals(extractBearerToken("Basic 123"), null);
});

Deno.test("extractBearerToken trims whitespace around token", () => {
  assertEquals(extractBearerToken("Bearer   token-value   "), "token-value");
});
