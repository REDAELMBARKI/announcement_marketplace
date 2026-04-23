import React, { ReactNode } from "react";
import { Button, TextField, CircularProgress, Box } from "@mui/material";

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
        const isFuture = stepNumber > currentStep;
        
        return (
          <div 
            key={step.key} 
            className={`aa-step-container ${isActive ? "active" : ""} ${isDone ? "done" : ""} ${isFuture ? "future" : ""}`}
          >
            <div className="aa-step-connector" />
            <button
              type="button"
              className="aa-step-circle"
              onClick={() => !isFuture && onStepClick(stepNumber)}
              disabled={isFuture}
            >
              {isDone ? "✓" : stepNumber}
            </button>
            <span className="aa-step-label">{step.label}</span>
          </div>
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
    <Box className="aa-field" sx={{ mb: 2 }}>
      <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600, color: '#475569' }}>
        {label}
      </Typography>
      {children}
    </Box>
  );
}

// We'll use MUI components directly in Add_Announcement.tsx for more control, 
// but we'll keep these helpers if they're still needed or update them to wrap MUI.

import { Typography } from "@mui/material";

export function IconCardButton({ icon: Icon, title, subtitle, active, ...props }: any) {
  return (
    <button 
      type="button" 
      className={`aa-icon-card ${active ? "active" : ""}`} 
      {...props}
      style={{
        cursor: 'pointer',
        width: '100%',
        height: '100%',
        minHeight: '100px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
        padding: '16px',
        border: '1px solid #e2e8f0',
        borderRadius: '12px',
        backgroundColor: active ? '#eff6ff' : '#fff',
        transition: 'all 0.2s ease'
      }}
    >
      {Icon && <Icon size={24} weight={active ? "BoldDuotone" : "Linear"} />}
      <strong>{title}</strong>
      {subtitle ? <small>{subtitle}</small> : null}
    </button>
  );
}

export function PillButton({ active, children, ...props }: any) {
  return (
    <button 
      type="button" 
      className={`aa-pill ${active ? "active" : ""}`} 
      {...props}
      style={{
        cursor: 'pointer'
      }}
    >
      {children}
    </button>
  );
}
