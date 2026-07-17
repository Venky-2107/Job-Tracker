import type { ChangeEvent } from "react";

interface inputFieldProps {
  type: string;
  value: string;
  id: string;
  placeholder: string;
  handleChange?: (e: ChangeEvent<HTMLInputElement>) => void;
  min?: string;
}

const InputField = (props: inputFieldProps) => {
  return (
    <input
      type={props.type}
      value={props.value}
      id={props.id}
      className="w-60 rounded-lg bg-white/10 border border-white/20
            text-white
            placeholder:text-slate-300
            px-4
            py-3
            m-2
            outline-none
            transition
            focus:border-cyan-400
            focus:ring-2
            focus:ring-cyan-400/40"
      onChange={props.handleChange}
      placeholder={props.placeholder}
      min={props.min}
    />
  );
};

export default InputField;
