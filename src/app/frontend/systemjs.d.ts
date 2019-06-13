interface Window {
  // tslint:disable-next-line:no-any
  define: (name: string, deps: string[], definitionFn: () => any) => void;

  System: {
    // @ts-ignore
    // tslint:disable-next-line:no-any
    import: (path) => Promise<any>;
  };
}
