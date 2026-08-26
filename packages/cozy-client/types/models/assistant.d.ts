export function createAssistant(client: CozyClient, assistantData: Assistant): Promise<Assistant>;
export function deleteAssistant(client: CozyClient, assistantId: string): Promise<void>;
export function editAssistant(client: CozyClient, assistantId: string, assistantData: Assistant): Promise<void>;
export type Assistant = {
    /**
     * - Name of the assistant
     */
    name: string;
    /**
     * - Prompt for the assistant
     */
    prompt: string;
    /**
     * - Optional icon for the assistant
     */
    icon?: string;
    /**
     * - Model identifier
     */
    model: string;
    /**
     * - Provider's base URL
     */
    baseUrl: string;
    /**
     * - API key for authentication
     */
    apiKey?: string;
    /**
     * - ID of the provider
     */
    providerId: string;
    /**
     * - Display name of the provider, used to
     * name the account. Defaults to the provider id.
     */
    providerName?: string;
};
import CozyClient from "../CozyClient";
