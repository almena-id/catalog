import { describe, expect, it } from "vitest";

import { safeDeepLink } from "./deep-link";

describe("a wallet's deep link", () => {
  it("keeps the wallet's scheme and https", () => {
    expect(safeDeepLink("almena://request?uri=x")).toBe("almena://request?uri=x");
    expect(safeDeepLink("almena:request?uri=x")).toBe("almena:request?uri=x");
    expect(safeDeepLink("https://almena.id/w/1")).toBe("https://almena.id/w/1");
  });

  it("refuses any other scheme, or no link", () => {
    for (const link of [
      "javascript:alert(1)",
      "JavaScript:alert(1)",
      " javascript:alert(1)",
      "data:text/html,<script>1</script>",
      "http://almena.id/w/1",
      "/relative",
      "",
      null,
      42,
    ])
      expect(safeDeepLink(link)).toBeNull();
  });
});
