import React from "react";
import clsx from "clsx";

export function Table({ children, className, ...props }) {
  return (
    <div className="w-full overflow-x-auto rounded-lg border border-gray-200">
      <table
        className={clsx("w-full text-sm text-left text-gray-700", className)}
        {...props}
      >
        {children}
      </table>
    </div>
  );
}

export function TableHead({ children, className, ...props }) {
  return (
    <thead
      className={clsx("bg-gray-100 text-xs uppercase text-gray-600", className)}
      {...props}
    >
      {children}
    </thead>
  );
}

export function TableHeader({ children, className, ...props }) {
  return (
    <th
      className={clsx("px-4 py-3 font-semibold", className)}
      scope="col"
      {...props}
    >
      {children}
    </th>
  );
}

export function TableBody({ children, className, ...props }) {
  return (
    <tbody className={clsx("divide-y divide-gray-200", className)} {...props}>
      {children}
    </tbody>
  );
}

export function TableRow({ children, className, ...props }) {
  return (
    <tr
      className={clsx("hover:bg-gray-50 transition-colors duration-150", className)}
      {...props}
    >
      {children}
    </tr>
  );
}

export function TableCell({ children, className, ...props }) {
  return (
    <td className={clsx("px-4 py-3", className)} {...props}>
      {children}
    </td>
  );
}

export function TableFooter({ children, className, ...props }) {
  return (
    <tfoot className={clsx("bg-gray-100", className)} {...props}>
      {children}
    </tfoot>
  );
}
