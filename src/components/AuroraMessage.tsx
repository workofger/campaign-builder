import { LOGOS } from '@/data/constants';

interface AuroraMessageProps {
  message: string;
  children?: React.ReactNode;
}

export function AuroraMessage({ message, children }: AuroraMessageProps) {
  return (
    <div className="flex gap-3 mb-6 font-sans">
      <div className="flex-shrink-0 w-10 h-10 rounded-full bg-pr-yellow flex items-center justify-center overflow-hidden">
        <img src={LOGOS.isoBlack} alt="Aurora" className="w-6 h-6" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-pr-yellow font-semibold mb-1">Aurora</p>
        <div className="bg-white/5 border border-white/10 rounded-2xl rounded-tl-none p-4">
          <p className="text-white/90 text-sm leading-relaxed">{message}</p>
          {children && <div className="mt-4">{children}</div>}
        </div>
      </div>
    </div>
  );
}
