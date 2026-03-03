import { type Static } from "@sinclair/typebox";
export declare const MeshPlanStepSchema: import("@sinclair/typebox").TObject<{
    id: import("@sinclair/typebox").TString;
    name: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    prompt: import("@sinclair/typebox").TString;
    dependsOn: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TArray<import("@sinclair/typebox").TString>>;
    agentId: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    sessionKey: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    thinking: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    timeoutMs: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TInteger>;
}>;
export declare const MeshWorkflowPlanSchema: import("@sinclair/typebox").TObject<{
    planId: import("@sinclair/typebox").TString;
    goal: import("@sinclair/typebox").TString;
    createdAt: import("@sinclair/typebox").TInteger;
    steps: import("@sinclair/typebox").TArray<import("@sinclair/typebox").TObject<{
        id: import("@sinclair/typebox").TString;
        name: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
        prompt: import("@sinclair/typebox").TString;
        dependsOn: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TArray<import("@sinclair/typebox").TString>>;
        agentId: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
        sessionKey: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
        thinking: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
        timeoutMs: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TInteger>;
    }>>;
}>;
export declare const MeshPlanParamsSchema: import("@sinclair/typebox").TObject<{
    goal: import("@sinclair/typebox").TString;
    steps: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TArray<import("@sinclair/typebox").TObject<{
        id: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
        name: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
        prompt: import("@sinclair/typebox").TString;
        dependsOn: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TArray<import("@sinclair/typebox").TString>>;
        agentId: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
        sessionKey: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
        thinking: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
        timeoutMs: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TInteger>;
    }>>>;
}>;
export declare const MeshRunParamsSchema: import("@sinclair/typebox").TObject<{
    plan: import("@sinclair/typebox").TObject<{
        planId: import("@sinclair/typebox").TString;
        goal: import("@sinclair/typebox").TString;
        createdAt: import("@sinclair/typebox").TInteger;
        steps: import("@sinclair/typebox").TArray<import("@sinclair/typebox").TObject<{
            id: import("@sinclair/typebox").TString;
            name: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
            prompt: import("@sinclair/typebox").TString;
            dependsOn: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TArray<import("@sinclair/typebox").TString>>;
            agentId: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
            sessionKey: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
            thinking: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
            timeoutMs: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TInteger>;
        }>>;
    }>;
    continueOnError: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TBoolean>;
    maxParallel: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TInteger>;
    defaultStepTimeoutMs: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TInteger>;
    lane: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
}>;
export declare const MeshPlanAutoParamsSchema: import("@sinclair/typebox").TObject<{
    goal: import("@sinclair/typebox").TString;
    maxSteps: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TInteger>;
    agentId: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    sessionKey: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    thinking: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    timeoutMs: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TInteger>;
    lane: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
}>;
export declare const MeshStatusParamsSchema: import("@sinclair/typebox").TObject<{
    runId: import("@sinclair/typebox").TString;
}>;
export declare const MeshRetryParamsSchema: import("@sinclair/typebox").TObject<{
    runId: import("@sinclair/typebox").TString;
    stepIds: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TArray<import("@sinclair/typebox").TString>>;
}>;
export type MeshPlanParams = Static<typeof MeshPlanParamsSchema>;
export type MeshWorkflowPlan = Static<typeof MeshWorkflowPlanSchema>;
export type MeshRunParams = Static<typeof MeshRunParamsSchema>;
export type MeshPlanAutoParams = Static<typeof MeshPlanAutoParamsSchema>;
export type MeshStatusParams = Static<typeof MeshStatusParamsSchema>;
export type MeshRetryParams = Static<typeof MeshRetryParamsSchema>;
