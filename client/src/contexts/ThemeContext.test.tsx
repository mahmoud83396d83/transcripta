/** @vitest-environment jsdom */
import React, { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, describe, expect, it } from "vitest";
import { ThemeProvider, useTheme } from "./ThemeContext";

(globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: (query: string) => ({ matches: query.includes("light") ? false : false, media: query, onchange: null, addEventListener: () => undefined, removeEventListener: () => undefined, addListener: () => undefined, removeListener: () => undefined, dispatchEvent: () => false }),
});

function ThemeProbe() {
  const { preference, setPreference } = useTheme();
  return <div><button type="button" data-preference={preference} onClick={() => setPreference("light")}>set light</button><button type="button" onClick={() => setPreference("system")}>set system</button></div>;
}

async function mount(preference?: "light" | "dark" | "system") {
  document.body.innerHTML = '<div id="root"></div>';
  if (preference) localStorage.setItem("theme", preference);
  const rootElement = document.getElementById("root")!;
  const root = createRoot(rootElement);
  await act(async () => {
    root.render(<ThemeProvider defaultTheme="dark" switchable><ThemeProbe /></ThemeProvider>);
    await Promise.resolve();
  });
  return root;
}

afterEach(() => {
  document.documentElement.className = "";
  document.documentElement.removeAttribute("data-theme-preference");
  localStorage.clear();
});

describe("ThemeProvider DOM contract", () => {
  let root: Root | undefined;
  afterEach(async () => {
    if (root) await act(async () => { root?.unmount(); await Promise.resolve(); });
    root = undefined;
  });

  it("applies the dark root state and persists the preference", async () => {
    root = await mount("dark");
    expect(document.documentElement.classList.contains("dark")).toBe(true);
    expect(document.documentElement.classList.contains("theme-light")).toBe(false);
    expect(document.documentElement.dataset.themePreference).toBe("dark");
    expect(localStorage.getItem("theme")).toBe("dark");
  });

  it("follows the system preference when system mode is selected", async () => {
    root = await mount("system");
    expect(document.documentElement.dataset.themePreference).toBe("system");
    expect(document.documentElement.classList.contains("dark")).toBe(true);
    expect(document.documentElement.classList.contains("theme-light")).toBe(false);
  });

  it("switches to the light root state through the rendered control", async () => {
    root = await mount("dark");
    await act(async () => {
      (document.querySelector("button") as HTMLButtonElement).click();
      await Promise.resolve();
    });
    expect(document.documentElement.classList.contains("theme-light")).toBe(true);
    expect(document.documentElement.classList.contains("dark")).toBe(false);
    expect(document.documentElement.dataset.themePreference).toBe("light");
    expect(localStorage.getItem("theme")).toBe("light");
  });
});
