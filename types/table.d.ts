import '@tanstack/react-table';

declare module '@tanstack/react-table' {
  interface TableMeta<TData> {
    onRefresh?: () => void;
  }
}
