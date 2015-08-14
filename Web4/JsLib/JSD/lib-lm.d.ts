// Add IE-specific interfaces to Window
interface Window {
    attachEvent(event: string, listener: EventListener): boolean;
    execScript(code: string, language?: string): any;
    clipboardData: DataTransfer;
}

declare var clipboardData: DataTransfer;

interface Document {
    selection: MSSelection;
    createEventObject(eventObj?: any): any;
}

interface MSSelection {
    type: string;
    typeDetail: string;
    createRange(): TextRange;
    clear(): void;
    createRangeCollection(): TextRangeCollection;
    empty(): void;
}
