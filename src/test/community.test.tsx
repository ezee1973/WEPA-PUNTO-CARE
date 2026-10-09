import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";

import { testimonialVersions, useCommunity, type ExperienceReview } from "@/lib/community-data";

const review: ExperienceReview = {
  hospital: "Demo Hospital",
  location: "Dorado",
  assignment: "Emergency Room · 4 weeks",
  ratings: { team: 5, onboarding: 4, workload: 4, housing: 5, island: 5, community: 5 },
  highlight: "My team made every arrival question easy.",
  advice: "Join a community group before landing.",
  recommend: true,
  returnAgain: true,
  status: "published",
  testimonialApproved: false,
};

describe("Nurse community", () => {
  beforeEach(() => localStorage.clear());

  it("builds testimonial options only from the nurse review and disclosed templates", () => {
    const versions = testimonialVersions(review);
    expect(versions.short).toBe(review.highlight);
    expect(versions.medium).toContain(review.advice);
    expect(versions.social).toContain(review.highlight);
    expect(versions.social).toContain("#WEPACare");
  });

  it("persists groups, connections, and travel teams together", () => {
    const { result } = renderHook(() => useCommunity());
    act(() => result.current.update((current) => ({
      ...current,
      joinedGroups: [...current.joinedGroups, "solo-buddies"],
      connections: ["maya"],
      team: ["maya"],
    })));
    const stored = JSON.parse(localStorage.getItem("wepa-community-v1") ?? "{}");
    expect(stored.joinedGroups).toContain("solo-buddies");
    expect(stored.connections).toEqual(["maya"]);
    expect(stored.team).toEqual(["maya"]);
  });
});