import { useRef } from "react";
import "./index.scss";

const DEFAULT_LENGTH = 6;

function OtpInput({ length = DEFAULT_LENGTH, value = "", onChange, error, disabled }) {
  const inputsRef = useRef([]);
  const digits = Array.from({ length }, (_, i) => value[i] || "");

  const setValue = (nextDigits) => {
    onChange?.(nextDigits.join("").slice(0, length));
  };

  const handleChange = (index, e) => {
    const raw = e.target.value.replace(/\D/g, "");
    if (!raw) {
      const next = [...digits];
      next[index] = "";
      setValue(next);
      return;
    }

    const chars = raw.split("");
    const next = [...digits];
    let cursor = index;
    for (const char of chars) {
      if (cursor >= length) break;
      next[cursor] = char;
      cursor += 1;
    }
    setValue(next);

    const focusIndex = Math.min(cursor, length - 1);
    inputsRef.current[focusIndex]?.focus();
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace") {
      if (digits[index]) {
        const next = [...digits];
        next[index] = "";
        setValue(next);
        return;
      }
      if (index > 0) {
        inputsRef.current[index - 1]?.focus();
        const next = [...digits];
        next[index - 1] = "";
        setValue(next);
      }
      return;
    }
    if (e.key === "ArrowLeft" && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
    if (e.key === "ArrowRight" && index < length - 1) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handlePaste = (index, e) => {
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "");
    if (!pasted) return;
    e.preventDefault();
    handleChange(index, { target: { value: pasted } });
  };

  return (
    <div className={`otp-input-group ${error ? "has-error" : ""}`}>
      {digits.map((digit, index) => (
        <input
          key={index}
          ref={(el) => (inputsRef.current[index] = el)}
          type="text"
          inputMode="numeric"
          maxLength={1}
          autoComplete="one-time-code"
          value={digit}
          disabled={disabled}
          onChange={(e) => handleChange(index, e)}
          onKeyDown={(e) => handleKeyDown(index, e)}
          onPaste={(e) => handlePaste(index, e)}
          onFocus={(e) => e.target.select()}
          className="otp-input-box"
          aria-label={`Chữ số OTP ${index + 1}`}
        />
      ))}
    </div>
  );
}

export default OtpInput;
