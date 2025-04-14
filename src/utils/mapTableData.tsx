/* eslint-disable @typescript-eslint/no-explicit-any */
import { Column } from '@/components/Table';

type DataItem = { [key: string]: any };

export const mapTableData = (data: DataItem[], columns: Column[]) => {
  return data.map(item => {
    const row: { [key: string]: any } = {};

    columns.forEach(col => {
      if (Array.isArray(col.field)) {
        row[col.label] = col.formatter
          ? col.formatter(col.field.map(field => item[field] ?? ''))
          : col.field
              .map(field => item[field] ?? '')
              .join(' ')
              .trim();
      } else {
        const value = item[col.field!];
        row[col.field!] = col.formatter ? col.formatter(value) : value || '';
      }
    });

    row['data'] = item;
    return row;
  });
};
