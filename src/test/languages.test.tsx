import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { LanguageProvider, translate } from "@/lib/i18n";
import { LanguageToggle } from "@/components/language-toggle";

describe("Marketplace language choice", () => {
  beforeEach(() => localStorage.clear());

  it("translates complete phrases and dynamic labels without altering canonical values", () => {
    expect(translate("Find your place", "es")).toBe("Encuentra tu lugar");
    expect(translate(" 12 weeks ", "es")).toBe(" 12 semanas ");
    expect(translate("Find your place", "en")).toBe("Find your place");
    expect(translate("Hospital Auxilio Mutuo", "es")).toBe("Hospital Auxilio Mutuo");
    const state = { stage: "Shortlisted", pay: 1800 };
    expect(translate(state, "es")).toBe(state);
  });

  it("persists the toggle and updates the document language", async () => {
    render(<LanguageProvider><LanguageToggle /></LanguageProvider>);
    fireEvent.click(screen.getByRole("button", { name: "Español" }));
    expect(localStorage.getItem("wepa-language")).toBe("es");
    await waitFor(() => expect(document.documentElement.lang).toBe("es"));
    expect(screen.getByRole("button", { name: "Español" })).toHaveAttribute("aria-pressed", "true");
    fireEvent.click(screen.getByRole("button", { name: "English" }));
    expect(localStorage.getItem("wepa-language")).toBe("en");
  });
});