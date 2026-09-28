export const FieldRow = ({ label, required, children, hint }) => (
    <div className="space-y-1.5 space-x-2.5">
        <label className="text-[12px] font-semibold uppercase tracking-wide text-gray-500 ">
            {label}{required && <span className="ml-0.5 text-red-500">*</span>}
        </label>
        {children}
        {hint && <p className="text-[11px] text-gray-400">{hint}</p>}
    </div>
);