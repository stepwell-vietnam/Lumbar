import { FC } from 'react';
import { Minus, Plus } from 'lucide-react';

interface NumberInputProps {
    value: number;
    onChange: (value: number) => void;
    min: number;
    max: number;
    step?: number;
    suffix?: string;
}

export const NumberInput: FC<NumberInputProps> = ({
    value,
    onChange,
    min,
    max,
    step = 1,
    suffix = '',
}) => {
    const decrease = () => {
        if (value > min) onChange(value - step);
    };

    const increase = () => {
        if (value < max) onChange(value + step);
    };

    return (
        <div className="flex items-center gap-1 bg-gray-100 rounded-lg px-2 py-1">
            <button
                onClick={decrease}
                disabled={value <= min}
                className="p-1 rounded hover:bg-gray-200 disabled:opacity-30 transition-colors"
            >
                <Minus className="w-3 h-3 text-gray-600" />
            </button>
            <span className="text-gray-800 font-medium min-w-[3rem] text-center text-sm">
                {value}{suffix}
            </span>
            <button
                onClick={increase}
                disabled={value >= max}
                className="p-1 rounded hover:bg-gray-200 disabled:opacity-30 transition-colors"
            >
                <Plus className="w-3 h-3 text-gray-600" />
            </button>
        </div>
    );
};
