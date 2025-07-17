import { CircleXIcon, InboxIcon } from "lucide-react";
import Spinner from "./common/Spinner";

const statusVariants = {
  loading: {
    icon: <Spinner variant="outline" size="lg" className="mb-2" />,
    color: "text-gray-500",
  },
  empty: { icon: <InboxIcon size={48} strokeWidth={0.5} />, color: "text-gray-500" },
  error: { icon: <CircleXIcon size={48} />, color: "text-red-500" },
};

export default function Status({
  variant = "empty",
  title = "Nothing here yet",
  message = "",
}) {
  return (
    <div className={`flex flex-col items-center ${statusVariants[variant].color}`}>
      {statusVariants[variant].icon}
      <p className="text-l font-semibold">{title}</p>
      {message && <p className="text-sm">{message}</p>}
    </div>
  );
}
