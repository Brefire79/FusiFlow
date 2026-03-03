export default function Spinner({ size = 'h-6 w-6' }: { size?: string }) {
  return (
    <div className="flex items-center justify-center py-12">
      <div
        className={`${size} animate-spin rounded-full border-2 border-accent/30 border-t-accent`}
      />
    </div>
  );
}
