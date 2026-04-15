// components/ui/DataTable.tsx
interface Column {
  header: string
  accessor: string | ((row: any) => React.ReactNode)
}

interface DataTableProps {
  data: any[]
  columns: Column[]
}

export const DataTable = ({ data, columns }: DataTableProps) => (
  <div className="overflow-x-auto bg-cardbg border border-borderLight rounded-xl">
    <table className="min-w-full">
      <thead className="border-b border-borderLight">
        <tr>
          {columns.map((col, idx) => (
            <th key={idx} className="text-left p-3 text-gray-400 font-medium">
              {col.header}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {data.map((row, rowIdx) => (
          <tr key={rowIdx} className="border-b border-borderLight last:border-0 hover:bg-white/5 transition">
            {columns.map((col, colIdx) => (
              <td key={colIdx} className="p-3 text-white">
                {typeof col.accessor === 'function' ? col.accessor(row) : row[col.accessor]}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
)