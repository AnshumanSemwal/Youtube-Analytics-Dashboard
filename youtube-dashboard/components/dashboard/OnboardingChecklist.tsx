interface Props {
    hasChannel: boolean;
    hasSynced:  boolean;
    hasVideos:  boolean;
  }
  
  export default function OnboardingChecklist({
    hasChannel,
    hasSynced,
    hasVideos,
  }: Props) {
    const allDone = hasChannel && hasSynced && hasVideos;
    if (allDone) return null;
  
    const steps = [
      { label: "Connect your YouTube channel", done: hasChannel },
      { label: "Fetch your analytics data",    done: hasSynced  },
      { label: "Explore your top video",       done: hasVideos  },
    ];
  
    return (
      <div className="border rounded-xl p-4 mb-6 dark:border-gray-800 bg-gray-50 dark:bg-gray-900">
        <p className="text-sm font-semibold text-foreground mb-3">
          Getting started
        </p>
        <div className="flex flex-col gap-2">
          {steps.map(({ label, done }) => (
            <div key={label} className="flex items-center gap-3">
              <div
                className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 text-xs font-bold transition-colors ${
                  done
                    ? "bg-black dark:bg-white text-white dark:text-black"
                    : "border-2 border-gray-300 dark:border-gray-600"
                }`}
              >
                {done && "✓"}
              </div>
              <p
                className={`text-sm ${
                  done
                    ? "line-through text-muted-foreground"
                    : "text-foreground"
                }`}
              >
                {label}
              </p>
            </div>
          ))}
        </div>
      </div>
    );
  }