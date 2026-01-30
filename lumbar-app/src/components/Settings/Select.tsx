import { FC } from 'react';
import { ChevronDown } from 'lucide-react';

interface SelectOption {
    value: string;
    label: string;
}

interface SelectProps {
    value: string;
    onChange: (value: string) => void;
    options: SelectOption[];
}

export const Select: FC<SelectProps> = ({ value, onChange, options }) => {
    return (
        <div className="relative">
            <select
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="
                    appearance-none bg-gray-100 text-gray-800 px-3 py-1.5 pr-8 rounded-lg
                    border border-gray-200 cursor-pointer text-sm
                    focus:outline-none focus:ring-2 focus:ring-emerald-400
                "
            >
                {options.map((opt) => (
                    <option key={opt.value} value={opt.value} className="bg-white">
                        {opt.label}
                    </option>
                ))}
            </select>
            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
        </div>
    );
};
