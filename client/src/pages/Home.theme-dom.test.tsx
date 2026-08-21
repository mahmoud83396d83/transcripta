/** @vitest-environment jsdom */
import React, { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ThemeProvider } from "../contexts/ThemeContext";

(globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: (query: string) => ({ matches: false, media: query, onchange: null, addEventListener: () => undefined, removeEventListener: () => undefined, addListener: () => undefined, removeListener: () => undefined, dispatchEvent: () => false }),
});

const { mutation, emptyData } = vi.hoisted(() => ({ mutation: () => ({ mutate: vi.fn(), isPending: false }), emptyData: [] as never[] }));
vi.mock("@/_core/hooks/useAuth", () => ({ useAuth: () => ({ user: null, loading: false, error: null, isAuthenticated: false, logout: vi.fn() }) }));
vi.mock("@/lib/trpc", () => ({
  trpc: {
    requestQuote: { create: { useMutation: mutation } },
    notificationConfig: { useQuery: () => ({ data: emptyData }) },
    notificationLog: {
      list: { useQuery: () => ({ data: emptyData }) },
      create: { useMutation: mutation },
      markRead: { useMutation: mutation },
      clear: { useMutation: mutation },
    },
  },
}));

import Home from "./Home";

afterEach(() => {
  document.documentElement.className = "";
  document.body.innerHTML = "";
  localStorage.clear();
});

describe("Home light-mode surface contract", () => {
  let root: Root | undefined;

  afterEach(async () => {
    if (root) await act(async () => { root?.unmount(); await Promise.resolve(); });
    root = undefined;
  });

  it("renders all critical light-mode sections with their contract classes", async () => {
    const host = document.createElement("div");
    document.body.appendChild(host);
    root = createRoot(host);
    await act(async () => {
      root!.render(<ThemeProvider defaultTheme="light" switchable><Home /></ThemeProvider>);
      await Promise.resolve();
    });

    expect(host.querySelector("main.theme-light")).not.toBeNull();
    expect(host.querySelector("#samples.theme-day-samples")).not.toBeNull();
    expect(host.querySelector("#pricing.theme-day-pricing")).not.toBeNull();
    expect(host.querySelector("#quote.theme-day-form")).not.toBeNull();

    const historyButton = Array.from(host.querySelectorAll("button")).find((button) => button.textContent?.includes("سجل الإشعارات"));
    expect(historyButton).toBeDefined();
    await act(async () => {
      historyButton?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
      await Promise.resolve();
    });
    expect(host.querySelector('[aria-live="polite"]')).not.toBeNull();
  });
});
