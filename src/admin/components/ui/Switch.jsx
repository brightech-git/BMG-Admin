export const Switch = ({ checked, onChange, label }) => (
    <div className="flex items-center justify-between my-2 gap-4">
        <span className="text-xs font-medium">{label}</span>
        <button
            type="button"
            onClick={() => onChange(!checked)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${checked ? 'bg-[var(--primary-color)]' : 'bg-gray-300'}`}
        >
            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${checked ? 'translate-x-6' : 'translate-x-1'}`}>
                {checked ? (
                    <i className="fas fa-check text-[10px] text-[var(--primary-color)] flex items-center justify-center h-full"></i>
                ) : (
                    <i className="fas fa-times text-[10px] text-gray-400 flex items-center justify-center h-full"></i>
                )}
            </span>
        </button>
    </div>
);