declare global {
  interface Window {
    electronAPI?: {
      openExternal: (url: string) => Promise<void>;
      platform: string;
      versions: NodeJS.ProcessVersions;
    };
  }
}

export {};
