import z from "zod";
import { GoalSchemas } from "./Goal.schemas";

export type CreateGoalPayload = z.infer<typeof GoalSchemas.createGoal>["body"];
export type UpdateGoalPayload = z.infer<typeof GoalSchemas.updateGoal>["body"];
export type ShareGoalPayload = z.infer<typeof GoalSchemas.shareGoal>["body"];
export type RemoveMemberFromGoalPayload = z.infer<
  typeof GoalSchemas.removeMember
>["body"];
