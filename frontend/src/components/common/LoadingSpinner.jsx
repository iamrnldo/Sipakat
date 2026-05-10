export default function LoadingSpinner({ size = "md", color = "blue" }) {
  const sizes = { sm: "h-4 w-4", md: "h-8 w-8", lg: "h-12 w-12" };
  const colors = {
    blue: "border-blue-600",
    white: "border-white",
    gray: "border-slate-400",
  };
  return (
    <div className="flex items-center justify-center">
      <div
        className={`${sizes[size]} animate-spin rounded-full border-2 border-t-transparent ${colors[color]}`}
      />
    </div>
  );
}
