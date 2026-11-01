"use client";

import { cn } from "cn";
import {
  CheckIcon,
  DownloadIcon,
  PenLineIcon,
  ScanQrCodeIcon,
  SendIcon,
  ShieldCheckIcon,
  XIcon,
  type LucideIcon,
} from "lucide-react";

import { useI18n } from "@/app/i18n/client";
import type { HolderApplication } from "@/app/lib/applications";

type StepKey = "pair" | "present" | "fill" | "submit" | "receive";

const icons: Record<StepKey, LucideIcon> = {
  pair: ScanQrCodeIcon,
  present: ShieldCheckIcon,
  fill: PenLineIcon,
  submit: SendIcon,
  receive: DownloadIcon,
};

/**
 * Where an application stands, as steps: which there are (presenting only
 * when its form asks for credentials), the one the holder is on — past the
 * last once the credential is in the wallet — and whether it stopped (not
 * accepted).
 */
export function applicationSteps(
  application: HolderApplication,
  submitting: boolean,
): { steps: StepKey[]; current: number; stopped: boolean } {
  const { offer, status } = application;
  const asks = offer.form.credentials.length > 0;
  const steps: StepKey[] = asks
    ? ["pair", "present", "fill", "submit", "receive"]
    : ["pair", "fill", "submit", "receive"];
  const at = (key: StepKey) => steps.indexOf(key);
  if (status === "open") return { steps, current: at("pair"), stopped: false };
  if (status === "paired") {
    if (submitting) return { steps, current: at("submit"), stopped: false };
    const verified = new Set(
      application.presented.filter((p) => p.verified).map((p) => p.key),
    );
    const missing = offer.form.credentials.some(
      (request) => request.required && !verified.has(request.key),
    );
    return {
      steps,
      current: asks && missing ? at("present") : at("fill"),
      stopped: false,
    };
  }
  if (status === "rejected")
    return { steps, current: at("receive"), stopped: true };
  if (status === "issued" && application.delivered_at)
    return { steps, current: steps.length, stopped: false };
  return { steps, current: at("receive"), stopped: false };
}

/** The application's steps across the top, each with its icon, joined by a progress line. */
export function Stepper({
  application,
  submitting,
}: {
  application: HolderApplication;
  submitting: boolean;
}) {
  const { t } = useI18n();
  const copy = t.apply.steps;
  const { steps, current, stopped } = applicationSteps(application, submitting);
  const count = steps.length;
  // The line runs between the first step's centre and the last one's.
  const inset = `${50 / count}%`;
  const done = Math.min(current, count - 1) / (count - 1);
  const shown = steps[Math.min(current, count - 1)];

  return (
    <nav aria-label={copy.label} className="grid gap-2">
      <ol
        className="relative grid"
        style={{ gridTemplateColumns: `repeat(${count}, minmax(0, 1fr))` }}
      >
        <span
          className="absolute top-[18px] h-0.5 -translate-y-1/2 rounded-full bg-border"
          style={{ left: inset, right: inset }}
          aria-hidden
        />
        <span
          className="absolute top-[18px] h-0.5 -translate-y-1/2 rounded-full bg-primary transition-[width] duration-500"
          style={{
            left: inset,
            width: `calc((100% - 2 * ${inset}) * ${done})`,
          }}
          aria-hidden
        />
        {steps.map((key, index) => {
          const Icon = icons[key];
          const past = index < current;
          const here = index === current;
          const failed = here && stopped;
          return (
            <li
              key={key}
              className="relative grid justify-items-center gap-1.5 text-center"
              aria-current={here ? "step" : undefined}
            >
              <span
                className={cn(
                  "grid size-9 place-items-center rounded-full border-2 bg-card transition-colors",
                  past && "border-primary bg-primary text-primary-foreground",
                  here &&
                    !failed &&
                    "border-primary text-primary ring-4 ring-brand-soft",
                  failed && "border-destructive text-destructive ring-4 ring-destructive-soft",
                  !past && !here && "border-border text-faint",
                )}
              >
                {past ? (
                  <CheckIcon className="size-4" aria-hidden />
                ) : failed ? (
                  <XIcon className="size-4" aria-hidden />
                ) : (
                  <Icon className="size-4" aria-hidden />
                )}
              </span>
              <span
                className={cn(
                  "hidden text-[12px] leading-tight sm:block",
                  here ? "font-semibold text-foreground" : "text-muted-foreground",
                )}
              >
                {copy[key]}
                {past && <span className="sr-only"> · {copy.done}</span>}
              </span>
            </li>
          );
        })}
      </ol>
      <p className="text-center text-[13px] text-muted-foreground sm:hidden">
        {current >= count
          ? copy.complete
          : copy.progress
              .replace("{n}", String(current + 1))
              .replace("{total}", String(count))
              .replace("{step}", copy[shown])}
      </p>
    </nav>
  );
}
