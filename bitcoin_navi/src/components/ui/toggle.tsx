'use client';

interface ToggleProps {
  isActive: boolean;
  onChange?: (isActive: boolean) => void;
}

export function Toggle({ isActive, onChange }: ToggleProps) {
  return (
    <button
      onClick={() => onChange?.(!isActive)}
      className={`
        relative w-12 h-6 rounded-full transition-all duration-300
        ${isActive
          ? 'bg-gradient-to-r from-primary to-accent'
          : 'bg-muted'
        }
        hover:shadow-[0_0_20px_rgba(59,130,246,0.3)]
      `}
      aria-label={isActive ? 'Disable' : 'Enable'}
    >
      <div
        className={`
          absolute top-0.5 w-5 h-5 bg-background rounded-full
          transition-all duration-300 shadow-lg
          ${isActive ? 'left-[26px]' : 'left-0.5'}
        `}
      >
        {/* Inner glow effect */}
        <div className={`
          absolute inset-0 rounded-full transition-opacity duration-300
          ${isActive
            ? 'bg-gradient-to-r from-primary/20 to-accent/20 opacity-100'
            : 'opacity-0'
          }
        `} />
      </div>
    </button>
  );
}
