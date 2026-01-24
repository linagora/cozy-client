export function createAssistant(client: CozyClient, assistantData: {
    name: string;
    prompt: string;
    icon?: string;
    isCustomModel: boolean;
    model: string;
    baseUrl: string;
    apiKey: string;
}): Promise<void>;
export function deleteAssistant(client: CozyClient, assistantId: string): Promise<void>;
export function editAssistant(client: CozyClient, assistantId: string, assistantData: {
    name: string;
    prompt: string;
    icon?: string;
    isCustomModel: boolean;
    model: string;
    baseUrl: string;
    apiKey?: string;
}): Promise<void>;

import CozyClient from "../CozyClient";
