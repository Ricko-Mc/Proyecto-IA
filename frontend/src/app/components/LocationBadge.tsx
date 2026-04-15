import { MapPin } from 'lucide-react';

export function LocationBadge() {
  return (
    <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[13px] font-medium text-[#5d6d82] dark:text-[#b8b8b8] bg-[#f1f5fb] dark:bg-[#191919] border border-[#dbe4ef] dark:border-[#313131] shadow-[inset_0_1px_0_rgba(255,255,255,0.75)] dark:shadow-none">
      <MapPin className="w-3.5 h-3.5" />
      <span>Guatemala</span>
    </div>
  );
}
