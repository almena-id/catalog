"use client";

import { CheckIcon, CopyIcon } from "lucide-react";
import { useState } from "react";

import { Button } from "./ui/button";

/** Copies `value` to the clipboard, and says so for a moment. */
export function CopyButton({
  value,
  label,
  copiedLabel,
}: {
  value: string;
  label: string;
  copiedLabel: string;
}) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      // No clipboard (an insecure origin): the text is there to select.
    }
  };
  return (
    <Button
      type="button"
      variant="ghost"
      size="icon-xs"
      onClick={() => void copy()}
      aria-label={copied ? copiedLabel : label}
      title={copied ? copiedLabel : label}
    >
      {copied ? <CheckIcon className="text-primary" /> : <CopyIcon />}
    </Button>
  );
}
