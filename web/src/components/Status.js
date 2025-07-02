import { CircleXIcon, InboxIcon, Loader2Icon } from "lucide-react";

export default function Status({
  type = "empty",
  title = "Nothing here yet",
  message = "",
}) {
  const variants = {
    loading: {
      icon: <Loader2Icon className="animate-spin" size={48} strokeWidth={1} />,
      color: "text-gray-500",
    },
    empty: { icon: <InboxIcon size={48} strokeWidth={0.5} />, color: "text-gray-500" },
    error: { icon: <CircleXIcon size={48} />, color: "text-red-500" },
  };

  return (
    <>
      <div className={`flex flex-col items-center ${variants[type].color}`}>
        {variants[type].icon}
        <p className="text-l font-semibold">{title}</p>
        {message && <p className="text-sm">{message}</p>}
      </div>
    </>
  );
}
