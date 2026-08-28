interface ProgressBarProps {
  done: number;
  total: number;
}

export function ProgressBar({ done, total }: ProgressBarProps) {
  const percent = total === 0 ? 0 : Math.round((done / total) * 100);

  return (
    <div className="w-full max-w-md">
      <div className="h-2 w-full overflow-hidden rounded bg-neutral-800">
        <div
          className="h-full bg-neutral-100 transition-all"
          style={{ width: `${percent}%` }}
        />
      </div>
      <p className="mt-1 text-center text-xs text-neutral-400">
        {done}/{total} chunks
      </p>
    </div>
  );
}
