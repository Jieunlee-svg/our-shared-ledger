import type { LucideIcon } from 'lucide-react';

interface TabItem<T extends string> {
  key: T;
  icon: LucideIcon;
  label: string;
}

interface BottomNavProps<T extends string> {
  tabs: TabItem<T>[];
  activeTab: T;
  onTabChange: (tab: T) => void;
}

export function BottomNav<T extends string>({ tabs, activeTab, onTabChange }: BottomNavProps<T>) {
  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-lg bg-card border-t border-border px-6 py-3 flex justify-around items-center z-50">
      {tabs.map(({ key, icon: Icon, label }) => (
        <button
          key={key}
          onClick={() => onTabChange(key)}
          className={`flex flex-col items-center gap-1 transition-colors ${activeTab === key ? 'tab-active' : 'tab-inactive'}`}
        >
          <Icon className="h-5 w-5" />
          <span className="text-xs">{label}</span>
        </button>
      ))}
    </nav>
  );
}
