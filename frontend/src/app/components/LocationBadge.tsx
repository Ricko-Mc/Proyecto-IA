import { MapPin } from 'lucide-react';

export function LocationBadge() {
  return (
    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-muted/50 rounded-full text-xs text-muted-foreground">
      <MapPin className="w-3 h-3" />
      <span>Guatemala</span>
    </div>
  );
}
