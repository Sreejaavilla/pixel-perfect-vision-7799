import { createServerFn } from "@tanstack/react-start";
import type { SubmitStageInput, SubmitStageResponse } from "../server/submissions.server";

export type { SubmitStageInput, SubmitStageResponse };

export const submitStageServerFn = createServerFn({ method: "POST" })
  .validator((data: unknown) => data as SubmitStageInput)
  .handler(async ({ data }): Promise<SubmitStageResponse> => {
    const { executeStageSubmission } = await import("../server/submissions.server");
    return executeStageSubmission(data);
  });

export const getLeaderboardServerFn = createServerFn({ method: "GET" }).handler(async () => {
  const { fetchLeaderboard } = await import("../server/submissions.server");
  return fetchLeaderboard();
});
