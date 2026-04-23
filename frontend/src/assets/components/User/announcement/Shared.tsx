import React, { ReactNode } from "react";

interface Step {
  key: string;
  label: string;
}

interface StepperProps {
  steps: Step[];
  currentStep: number;
  onStepClick: (stepNumber: number) => void;
}

export function Stepper({ steps, currentStep, onStepClick }: StepperProps) {
  return (
    <div className="aa-stepper">
      {steps.map((step, index) => {
        const stepNumber = index + 1;
        const isActive = currentStep === stepNumber;
        const isDone = currentStep > stepNumber;
        return (
          <button
            key={step.key}
            type="button"
            className={`aa-step ${isActive ? "active" : ""} ${isDone ? "done" : ""}`}
            onClick={() => onStepClick(stepNumber)}
          >
            <span className="aa-step-number">{stepNumber}</span>
            <small>{step.label}</small>
          </button>
        );
      })}
    </div>
  );
}

interface FieldProps {
  label: string;
  children: ReactNode;
}

export function Field({ label, children }: FieldProps) {
  return (
    <label className="aa-field">
      <span>{label}</span>
      {children}
    </label>
  );
}

export function TextInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input className="aa-input" {...props} />;
}

export function TextArea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className="aa-input aa-textarea" {...props} />;
}

interface SelectInputProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  options: { label: string; value: string | number }[];
}

export function SelectInput({ options, ...props }: SelectInputProps) {
  return (
    <select className="aa-input" {...props}>
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
}

interface PillButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  active: boolean;
  children: ReactNode;
}

export function PillButton({ active, children, ...props }: PillButtonProps) {
  return (
    <button type="button" className={`aa-pill ${active ? "active" : ""}`} {...props}>
      {children}
    </button>
  );
}

interface IconCardButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon: any; // Using any because icons from different libs have different props
  title: string;
  subtitle?: string;
  active: boolean;
}

export function IconCardButton({ icon: Icon, title, subtitle, active, ...props }: IconCardButtonProps) {
  return (
    <button type="button" className={`aa-icon-card ${active ? "active" : ""}`} {...props}>
      {/* We pass both solar and lucide props, most will ignore what they don't use */}
      <Icon size={22} weight="BoldDuotone" strokeWidth={2} />
      <strong>{title}</strong>
      {subtitle ? <small>{subtitle}</small> : null}
    </button>
  );
}
