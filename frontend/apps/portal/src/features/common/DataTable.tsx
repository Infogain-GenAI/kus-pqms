import { DataTable as UiDataTable, type DataTableProps } from '@pqms/ui-library'

/**
 * Screen-level alias of the ui-library DataTable, borderless so it sits flush
 * inside a SectionCard. Import DataTable from here (not also from
 * `@pqms/ui-library` directly) so a screen has one source for it — `DataTableColumn`
 * / `DataTableSort` types still come straight from `@pqms/ui-library`.
 */
export function DataTable<T>(props: DataTableProps<T>) {
  return <UiDataTable<T> {...props} style={{ border: 'none', borderRadius: 0, boxShadow: 'none', ...props.style }} />
}
