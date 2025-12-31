import { Loader2 } from "lucide-react";

function Loading({ message = "Loading..." }) {
  return (
    <div className="flex flex-col items-center justify-center py-20">
      <Loader2 className="w-12 h-12 text-primary-500 animate-spin" />
      <p className="mt-4 text-gray-400">{message}</p>
    </div>
  );
}

export default Loading;
