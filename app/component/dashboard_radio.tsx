'use client'

interface Props {
    checked: boolean
    onChange: (next: boolean) => void
    disabled?: boolean
}

export default function DashboardRadio({ checked, onChange, disabled = false }: Props) {
    return (
        <button
            type="button"
            role="switch"
            aria-checked={checked}
            disabled={disabled}
            onClick={() => onChange(!checked)}
            className={`relative h-[20px] w-[36px] ${checked ? 'bg-[#30A46F]' : 'bg-[#E3E3E8]'} rounded-full p-[2px] transition-colors ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
        >
            <div className={`w-[16px] h-[16px] transform ${checked ? 'translate-x-[100%]' : 'translate-x-[0]'} transition-all duration-100 bg-[#ffffff] rounded-full drop-shadow-sm`}></div>
        </button>
    )
}
