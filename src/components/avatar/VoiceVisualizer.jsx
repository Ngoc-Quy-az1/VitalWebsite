const bars = [0, 1, 2, 3, 4, 5, 6];

export default function VoiceVisualizer({ active, variant = "speaking" }) {
  if (!active) {
    return (
      <div className="flex h-10 items-end justify-center gap-1 opacity-40">
        {bars.map((i) => (
          <span key={i} className="h-2 w-1 rounded-full bg-teal-400/60" />
        ))}
      </div>
    );
  }

  const color =
    variant === "listening"
      ? "bg-cyan-400"
      : variant === "thinking"
        ? "bg-amber-400"
        : "bg-teal-500";

  return (
    <div className="flex h-10 items-end justify-center gap-1" aria-hidden>
      {bars.map((i) => (
        <span
          key={i}
          style={{ animationDelay: `${i * 90}ms` }}
          className={`wave-bar h-8 w-1 rounded-full ${color}`}
        />
      ))}
    </div>
  );
}
