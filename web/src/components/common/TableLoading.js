import { Skeleton } from "./ui/skeleton";
import { TableCell, TableRow } from "./ui/table";

export default function TableLoading({ cols, rows = 3 }) {
  return Array.from({ length: rows }).map((_, rowIndex) => (
    <TableRow key={rowIndex}>
      {Array.from({ length: cols }).map((_, colIndex) => (
        <TableCell key={colIndex}>
          <Skeleton className="h-4" />
        </TableCell>
      ))}
    </TableRow>
  ));
}
