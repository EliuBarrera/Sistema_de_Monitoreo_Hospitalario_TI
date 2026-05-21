import { Badge } from "@/components/ui/badge";

interface Props {
  status: string;
}

const statusStyles: Record<string, string> = {
  active:
    "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300",

  inactive:
    "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",

  maintenance:
    "bg-yellow-100 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-300",

  offline:
    "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300",
};

function DeviceStatusBadge({
  status,
}: Props) {

  return (
    <Badge
      className={`
        border-0
        font-medium
        ${statusStyles[status]}
      `}
    >
      {status}
    </Badge>
  );
}

export default DeviceStatusBadge;