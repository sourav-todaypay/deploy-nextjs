/* eslint-disable @typescript-eslint/no-explicit-any */

import { ActionDropdown } from './ActionDropdown';

export interface Column {
  label: string;
  field?: string | string[];
  staticValue?: string;
  formatter?: (value: any) => string | undefined;
  render?: (value: any, row: Record<string, any>) => React.ReactNode;
  actionOptions?: {
    label: string;
    onClick: (row: Record<string, any>) => void;
  }[];
}

interface TableProps {
  data: Record<string, any>[];
  columns: Column[];
  onRowClick?: (rowData: Record<string, any>) => void;
}

export default function Table({ data, columns, onRowClick }: TableProps) {
  const handleRowClick = (rowData: Record<string, any>) => {
    if (onRowClick) {
      onRowClick(rowData.data);
    }
  };

  return (
    <div className="overflow-x-auto rounded-lg shadow-lg bg-white dark:bg-gray-800 transition duration-300 ease-in-out">
      <table className="min-w-full table-auto text-sm text-left border-collapse">
        <thead className="bg-gray-300 dark:bg-gray-700 text-gray-700 dark:text-gray-200 transition duration-300 ease-in-out">
          <tr>
            {columns.map((column, index) => (
              <th
                key={index}
                className="p-3 font-semibold text-gray-800 dark:text-gray-200 transition duration-300"
              >
                {column.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.length > 0 ? (
            data.map((row, rowIndex) => (
              <tr
                key={rowIndex}
                className="border-b dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 dark:bg-gray-800 transition duration-300 ease-in-out cursor-pointer"
                onClick={() => handleRowClick(row)}
              >
                {columns.map((column, colIndex) => (
                  <td
                    key={colIndex}
                    className="p-3 text-sm text-gray-700 dark:text-gray-100 transition duration-300 ease-in-out"
                  >
                    {column.staticValue !== undefined ? (
                      column.staticValue
                    ) : column.actionOptions ? (
                      <ActionDropdown
                        options={column.actionOptions}
                        row={row}
                      />
                    ) : column.render ? (
                      column.render(row[column.field as string], row)
                    ) : Array.isArray(column.field) ? (
                      row[column.label] || (
                        <i className="bi bi-dash text-gray-500 dark:text-gray-400"></i>
                      )
                    ) : (
                      row[column.field as string] || (
                        <i className="bi bi-dash text-gray-500 dark:text-gray-400"></i>
                      )
                    )}
                  </td>
                ))}
              </tr>
            ))
          ) : (
            <tr>
              <td
                colSpan={columns.length}
                className="text-center py-4 text-gray-500 dark:text-gray-400 transition duration-200"
              >
                Record not found
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
