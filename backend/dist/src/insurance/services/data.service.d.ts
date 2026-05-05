export declare class DataService {
    private dataDir;
    constructor();
    readData<T>(fileName: string): T[];
    writeData<T>(fileName: string, data: T[]): boolean;
    generateId(prefix: string, existingIds: string[]): string;
}
