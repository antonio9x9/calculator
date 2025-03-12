import React from 'react';
import './Button.css';

interface ButtonProps {
    onClick: (value: string) => void;
    onKeyDown?: (event: React.KeyboardEvent<HTMLButtonElement>) => void;
    label: string;
}

const Button: React.FC<ButtonProps> = ({ onClick, onKeyDown, label }) => {
    return (
        <button className="button" onClick={() => onClick(label)} onKeyDown={onKeyDown}>
            {label}
        </button>
    );
};

export default Button;