export default function Brand({ className = '' }) {
  return (
    <a
      href="/"
      aria-label="Epoxipetro, ir al inicio"
      translate="no"
      className={`flex items-center ${className}`}
    >
      <img
        src="/brand/epoxipetro-mark.svg"
        alt=""
        width={40}
        height={40}
        className="h-10 w-10"
      />
      <span className="-ml-1 text-[1.55rem] font-bold leading-none tracking-[-0.03em] text-ink">
        poxipetro
      </span>
    </a>
  );
}

