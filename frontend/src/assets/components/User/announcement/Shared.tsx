import React from "react";

export function Stepper({ steps, currentStep, onStepClick }) {
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

export function Field({ label, children }) {
  return (
    <label className="aa-field">
      <span>{label}</span>
      {children}
    </label>
  );
}

export function TextInput(props) {
  return <input className="aa-input" {...props} />;
}

export function TextArea(props) {
  return <textarea className="aa-input aa-textarea" {...props} />;
}

export function SelectInput({ options, ...props }) {
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

export function PillButton({ active, children, ...props }) {
  return (
    <button type="button" className={`aa-pill ${active ? "active" : ""}`} {...props}>
      {children}
    </button>
  );
}

export function IconCardButton({ icon: Icon, title, subtitle, active, ...props }) {
  // Check if it's a Solar icon by checking if it accepts weight prop or by standard convention
  // We'll pass BoldDuotone to Solar icons. 
  // Lucide icons don't have weight prop but have strokeWidth.
  return (
    <button type="button" className={`aa-icon-card ${active ? "active" : ""}`} {...props}>
      <Icon size={22} weight="BoldDuotone" strokeWidth={2} />
      <strong>{title}</strong>
      {subtitle ? <small>{subtitle}</small> : null}
    </button>
  );
}
