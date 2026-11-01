import { cn } from "cn";

import { Button } from "@/app/components/ui/button";
import { safeDeepLink } from "@/app/lib/deep-link";

/**
 * What the Almena wallet scans, drawn as the registry draws it: the QR code,
 * the button that opens the wallet on this device instead (only for a link
 * whose scheme a wallet opens), the wait announced to screen readers
 * (`status`, a live region that changes rarely) and, beside it but outside
 * it, what changes every second (`aside`: the countdown), so it is not read
 * out on every tick.
 */
export function WalletQr({
  qr,
  deepLink,
  label,
  open,
  status,
  aside,
  className,
}: {
  /** The SVG drawn server side from the API's link. */
  qr: string;
  deepLink: string;
  /** What the code is, for screen readers. */
  label: string;
  open: string;
  status: React.ReactNode;
  aside?: React.ReactNode;
  className?: string;
}) {
  const href = safeDeepLink(deepLink);
  return (
    <div className={cn("grid gap-3.5", className)}>
      <div
        className="qr mx-auto w-[220px] rounded-xl bg-qr-paper p-2.5"
        role="img"
        aria-label={label}
        // The SVG comes from the QR library, drawn from the API's link.
        dangerouslySetInnerHTML={{ __html: qr }}
      />
      {href && (
        <Button asChild size="lg" className="w-full">
          <a href={href}>{open}</a>
        </Button>
      )}
      <p className="text-center text-sm text-muted-foreground">
        <span role="status">{status}</span>
        {aside && <> {aside}</>}
      </p>
    </div>
  );
}
