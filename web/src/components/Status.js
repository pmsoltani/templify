import { InboxIcon, Loader2Icon } from "lucide-react";

export default function Status({
  type = "empty",
  title = "Nothing here yet",
  message = "",
}) {
  const icons = {
    loading: <Loader2Icon className="animate-spin" size={48} strokeWidth={1} />,
    empty: <InboxIcon size={48} strokeWidth={0.5} />,
  };

  return (
    <>
      <div className="flex flex-col items-center text-gray-500">
        {icons[type]}
        <p className="text-l font-semibold">{title}</p>
        {message && <p className="text-sm">{message}</p>}
      </div>
    </>
  );
}
