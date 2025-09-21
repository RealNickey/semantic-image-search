import { Badge } from "@/components/ui/badge";

export const MatchBadge = ({
  type,
  similarity,
}: {
  type: "direct" | "semantic";
  similarity?: number;
}) => {
  return (
    <div className="animate-in fade-in-0 slide-in-from-bottom-2 duration-300">
      {type === "semantic" ? (
        <>
          <Badge
            variant={"default"}
            className="block sm:hidden bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg 
                     hover:shadow-green-500/25 transition-all duration-200 border-0"
          >
            {(similarity! * 100).toFixed(0)}%
          </Badge>
          <Badge
            variant={"default"}
            className="hidden sm:block bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg 
                     hover:shadow-green-500/25 transition-all duration-200 border-0"
          >
            <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
            AI Match: {(similarity! * 100).toFixed(0)}%
          </Badge>
        </>
      ) : (
        <Badge 
          variant={"secondary"} 
          className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-lg 
                   hover:shadow-blue-500/25 transition-all duration-200 border-0"
        >
          <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          Perfect Match
        </Badge>
      )}
    </div>
  );
};
