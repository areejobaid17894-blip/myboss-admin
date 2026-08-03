import { useEffect, useRef, type KeyboardEvent, type ClipboardEvent } from 'react';
import styles from './OtpInput.module.css';

const OTP_LENGTH = 6;

interface OtpInputProps {
  value: string;
  onChange: (value: string) => void;
  onComplete?: (value: string) => void;
  disabled?: boolean;
  autoFillCode?: string;
  /** When true, auto-filled demo codes also trigger onComplete. Default false so users see the OTP step. */
  submitOnAutoFill?: boolean;
}

export function OtpInput({
  value,
  onChange,
  onComplete,
  disabled = false,
  autoFillCode,
  submitOnAutoFill = false,
}: OtpInputProps) {
  const inputsRef = useRef<Array<HTMLInputElement | null>>([]);

  const digits = Array.from({ length: OTP_LENGTH }, (_, index) => value[index] ?? '');

  useEffect(() => {
    if (!autoFillCode || autoFillCode.length !== OTP_LENGTH) return;
    onChange(autoFillCode);
    if (submitOnAutoFill) {
      onComplete?.(autoFillCode);
    }
    // Auto-fill once when demo code arrives from the API.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoFillCode, submitOnAutoFill]);

  useEffect(() => {
    if (!disabled) {
      inputsRef.current[0]?.focus();
    }
  }, [disabled]);

  const updateDigits = (nextDigits: string[]) => {
    const code = nextDigits.join('').slice(0, OTP_LENGTH);
    onChange(code);
    if (code.length === OTP_LENGTH) {
      onComplete?.(code);
    }
  };

  const handleChange = (index: number, nextValue: string) => {
    const cleaned = nextValue.replace(/\D/g, '');

    if (cleaned.length > 1) {
      const pasted = cleaned.slice(0, OTP_LENGTH).split('');
      const next = [...digits];
      pasted.forEach((digit, offset) => {
        if (index + offset < OTP_LENGTH) {
          next[index + offset] = digit;
        }
      });
      updateDigits(next);
      const focusIndex = Math.min(index + pasted.length, OTP_LENGTH - 1);
      inputsRef.current[focusIndex]?.focus();
      return;
    }

    const next = [...digits];
    next[index] = cleaned;
    updateDigits(next);

    if (cleaned && index < OTP_LENGTH - 1) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Backspace' && !digits[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
      const next = [...digits];
      next[index - 1] = '';
      updateDigits(next);
    }
  };

  const handlePaste = (event: ClipboardEvent<HTMLInputElement>) => {
    event.preventDefault();
    const pasted = event.clipboardData.getData('text').replace(/\D/g, '').slice(0, OTP_LENGTH);
    if (!pasted) return;
    updateDigits(pasted.split(''));
    inputsRef.current[Math.min(pasted.length, OTP_LENGTH) - 1]?.focus();
  };

  return (
    <div className={styles.wrapper} dir="ltr">
      {digits.map((digit, index) => (
        <input
          key={index}
          ref={(element) => {
            inputsRef.current[index] = element;
          }}
          className={`${styles.box} ${digit ? styles.filled : ''}`}
          type="text"
          inputMode="numeric"
          autoComplete={index === 0 ? 'one-time-code' : 'off'}
          maxLength={OTP_LENGTH}
          value={digit}
          disabled={disabled}
          aria-label={`Digit ${index + 1}`}
          onChange={(event) => handleChange(index, event.target.value)}
          onKeyDown={(event) => handleKeyDown(index, event)}
          onPaste={handlePaste}
        />
      ))}
    </div>
  );
}
