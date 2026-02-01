// This file tells TypeScript to trust that the @google/genai module exists
// even if it can't find the official type definitions during the build.

declare module '@google/genai' {
    export enum Type {
        TYPE_UNSPECIFIED = 'TYPE_UNSPECIFIED',
        STRING = 'STRING',
        NUMBER = 'NUMBER',
        INTEGER = 'INTEGER',
        BOOLEAN = 'BOOLEAN',
        ARRAY = 'ARRAY',
        OBJECT = 'OBJECT',
        NULL = 'NULL',
    }

    export class GoogleGenAI {
        constructor(config: { apiKey: string });
        models: {
            generateContent(params: any): Promise<{
                text: string;
                candidates?: any[];
            }>;
        };
    }
}
