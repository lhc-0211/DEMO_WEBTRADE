import type { UseFormRegisterReturn } from "react-hook-form";

type InputFieldOTPProps = {
  length?: number;
  onChange?: (value: string) => void;
  registration?: UseFormRegisterReturn;
};

export default function InputFieldOtp({
  length = 6,
  registration,
}: InputFieldOTPProps) {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Cho phép các phím điều hướng, backspace, delete
    const allowedKeys = [
      "Backspace",
      "Delete",
      "ArrowLeft",
      "ArrowRight",
      "Tab",
    ];
    if (allowedKeys.includes(e.key)) return;

    // Nếu không phải số thì chặn nhập
    if (!/^[0-9]$/.test(e.key)) {
      e.preventDefault();
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/\D/g, ""); // chỉ giữ lại số
    if (val.length > length) val = val.slice(0, length);

    // Cập nhật lại giá trị input khi người dùng paste
    e.target.value = val;

    registration?.onChange?.(e);
  };

  return (
    <div className="relative">
      <input
        type="text"
        inputMode="numeric"
        maxLength={length}
        autoComplete="off"
        {...registration}
        onKeyDown={handleKeyDown}
        onChange={handleChange}
        className="w-full tracking-[0.8em] text-center text-lg font-medium py-3 rounded-xl border border-yellow-500 shadow-[0_0_0_2px_rgba(250,204,21,0.3)] text-yellow-500"
      />
    </div>
  );
}
