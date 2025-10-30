export default function OrderTableSkeleton() {
  const rows = Array.from({ length: 6 });

  return (
    <div className="w-full h-[448px] overflow-auto rounded-md text-xs">
      <table className="w-full border-collapse animate-pulse">
        <thead>
          <tr>
            <th colSpan={3} className="px-2 py-1">
              <div className="h-[22px] bg-gray-300 rounded-md" />
            </th>
            <th colSpan={4} className="px-2 py-1">
              <div className="h-[22px] bg-gray-300 rounded-md" />
            </th>
            <th colSpan={1} className="px-2 py-1">
              <div className="h-[22px] bg-gray-300 rounded-md" />
            </th>
          </tr>
        </thead>

        <tbody>
          {rows.map((_, idx) => (
            <tr key={idx}>
              {Array.from({ length: 8 }).map((__, i) => (
                <td key={i} className="px-2 py-2">
                  <div className="h-3 w-full bg-gray-300 rounded" />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
