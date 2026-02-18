# Bug Fix: LLM JSON Response Extraction Fails with "Unterminated String"

## Symptoms

Every AI generation attempt fails. In the console you see a repeating pattern like:

```
[DEBUG] Found complete JSON block, length: 5802
[DEBUG ERROR] JSON parse error: Unterminated string in JSON at position 5802
[DEBUG] Attempting to repair JSON...
[DEBUG ERROR] Repaired JSON parse failed: Unterminated string in JSON at position 5810
[DEBUG ERROR] Fixed JSON parse failed: Unterminated string in JSON at position 5810
```

Key identifiers:
- The error position matches (or is within ~10 of) the reported block length
- Repair attempts all fail with the same error
- Each retry produces a *different* truncation length (e.g. 5802 → 7890 → 9079)
- Both the primary LLM and any fallback LLMs all fail the same way

## Root Cause

The code extracts the JSON block from the LLM's markdown-fenced response using a
**non-greedy** regex. Look for a line like this:

```javascript
let jsonBlockMatch = text.match(/```json\s*([\s\S]*?)\s*```/);
```

The `[\s\S]*?` is non-greedy — it matches the **shortest** possible string between
`` ```json `` and the next `` ``` ``. This works fine when the response body contains
no backticks. But LLMs generating code (especially WordPress plugins, or any code
with documentation) frequently produce PHP/JS doc-block comments that include
Markdown code examples:

```php
/**
 * Example usage:
 * ```
 * $plugin->run();
 * ```
 */
```

Those inner `` ``` `` fences live inside JSON string values (the file contents). The
non-greedy regex hits the first `` ``` `` it finds — inside the PHP comment — and
stops there, returning a JSON string that is cut off mid-value.

**Why retries don't help:** Each attempt generates slightly different code, so the
false fence lands at a different character offset. The truncation point changes every
time, but the JSON is always broken. None of the fallback repair strategies
(`repairJsonString`, brace-closing) can recover a mid-string truncation because the
missing content is unknown.

## The Fix

Change the regex from non-greedy to **greedy** so it matches up to the **last**
`` ``` `` in the response (the real closing fence):

```javascript
// BEFORE (broken) — stops at the FIRST ``` anywhere in the response
let jsonBlockMatch = text.match(/```json\s*([\s\S]*?)\s*```/);

// AFTER (fixed) — stops at the LAST ``` which is the actual closing fence
let jsonBlockMatch = text.match(/```json\s*([\s\S]*)\s*```/);
```

The only change is removing the `?` from `*?` to make it greedy.

## How to Find the Line

Search the codebase for the broken pattern:

```
[\s\S]*?)\s*```
```

Or search for the function that parses LLM responses — it's likely named something
like `parseGeminiResponse`, `parseLLMResponse`, `parseAIResponse`, or similar.
The regex will be near log messages like `"Found complete JSON block"` or
`"Found incomplete JSON block"`.

## Verification

After the fix, a successful generation will log something like:

```
[DEBUG] Found complete JSON block, length: 18432
[DEBUG] ✅ Direct JSON parse successful
```

The length should now reflect the full response (much larger than before), and
parsing succeeds on the first attempt with no repair needed.

## Edge Cases

- **If the response is genuinely truncated by the API** (model hit its token limit,
  `finish_reason === 'length'`): this fix won't help for that scenario. But that's a
  different failure mode — you'd see the token limit logged and the length would not
  match across retries in a steadily-increasing pattern. The fix here handles the
  false-fence case.
- **If there are multiple JSON blocks in one response**: greedy matching will capture
  everything between the first `` ```json `` and the last `` ``` ``, which may be
  too much. In practice LLM responses for code generation contain exactly one JSON
  block, so this is not an issue.
