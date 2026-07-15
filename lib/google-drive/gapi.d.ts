export {};

declare global {
  interface Window {
    gapi: {
      load: (
        api: string,
        options: { callback: () => void; onerror?: () => void },
      ) => void;
    };
  }
}
