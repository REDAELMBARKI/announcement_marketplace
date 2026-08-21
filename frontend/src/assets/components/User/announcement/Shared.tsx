import React, { ReactNode } from "react";
import { Box, Typography, LinearProgress } from "@mui/material";

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
  const currentStepData = steps[currentStep - 1];
  const progressPercent = (currentStep / steps.length) * 100;

  return (
    <Box sx={{ width: '100%', mb: { xs: 3, md: 5 } }}>
      {/* Desktop Stepper */}
      <Box className="aa-stepper" sx={{ display: { xs: 'none', md: 'flex' } }}>
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
      </Box>

      {/* Mobile Stepper Header & Progress Bar */}
      <Box sx={{ display: { xs: 'block', md: 'none' }, bgcolor: '#f8fafc', p: 2, borderRadius: 3, border: '1px solid #e2e8f0' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
          <Typography variant="body2" sx={{ fontWeight: 700, color: '#3b82f6' }}>
            Étape {currentStep} / {steps.length}
          </Typography>
          <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#1e293b' }}>
            {currentStepData?.label}
          </Typography>
        </Box>
        
        <LinearProgress 
          variant="determinate" 
          value={progressPercent} 
          sx={{ 
            height: 8, 
            borderRadius: 4, 
            bgcolor: '#e2e8f0',
            '& .MuiLinearProgress-bar': {
              borderRadius: 4,
              backgroundColor: '#3b82f6',
            }
          }} 
        />

        {/* Compact Dot Navigation */}
        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1.5, mt: 1.5 }}>
          {steps.map((step, index) => {
            const stepNumber = index + 1;
            const isActive = currentStep === stepNumber;
            const isDone = currentStep > stepNumber;
            const isFuture = stepNumber > currentStep;

            return (
              <Box
                key={step.key}
                onClick={() => !isFuture && onStepClick(stepNumber)}
                sx={{
                  width: isActive ? 24 : 10,
                  height: 10,
                  borderRadius: 5,
                  bgcolor: isDone ? '#10b981' : isActive ? '#3b82f6' : '#cbd5e1',
                  transition: 'all 0.3s ease',
                  cursor: isFuture ? 'default' : 'pointer',
                  opacity: isFuture ? 0.5 : 1
                }}
              />
            );
          })}
        </Box>
      </Box>
    </Box>
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
        minHeight: '90px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '6px',
        padding: '12px 10px',
        border: active ? '2px solid #3b82f6' : '1px solid #e2e8f0',
        borderRadius: '14px',
        backgroundColor: active ? '#eff6ff' : '#fff',
        boxShadow: active ? '0 4px 12px rgba(59, 130, 246, 0.15)' : '0 1px 3px rgba(0,0,0,0.02)',
        transition: 'all 0.2s ease'
      }}
    >
      {Icon && <Icon size={26} color={active ? '#2563eb' : '#64748b'} />}
      <strong style={{ fontSize: '0.875rem', color: active ? '#1d4ed8' : '#334155', textAlign: 'center', fontWeight: active ? 700 : 600 }}>{title}</strong>
      {subtitle ? <small style={{ fontSize: '0.75rem', color: '#64748b' }}>{subtitle}</small> : null}
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
        cursor: 'pointer',
        border: active ? '1px solid #3b82f6' : '1px solid #cbd5e1',
        backgroundColor: active ? '#eff6ff' : '#fff',
        color: active ? '#1d4ed8' : '#334155',
        borderRadius: '10px',
        padding: '8px 16px',
        fontWeight: active ? 700 : 500,
        transition: 'all 0.2s ease'
      }}
    >
      {children}
    </button>
  );
}

