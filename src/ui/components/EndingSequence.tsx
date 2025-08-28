/**
 * EndingSequence.tsx
 * Component for displaying ending sequences
 */

import React, { useState, useEffect, useCallback } from 'react';
import { EndingManager, EndingStep } from '../../engine/endings/EndingManager';
import './EndingSequence.css';

interface EndingSequenceProps {
  onComplete?: () => void;
}

export default function EndingSequence({ onComplete }: EndingSequenceProps) {
  const [endingManager] = useState(() => EndingManager.getInstance());
  const [currentStep, setCurrentStep] = useState<EndingStep | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);

  // Function to advance to the next step
  const advanceSequence = useCallback((nextStepId?: string) => {
    const nextStep = endingManager.advanceSequence(nextStepId);
    
    if (nextStep) {
      setCurrentStep(nextStep);
      // If the step has a duration, automatically advance after that time
      if (nextStep.duration && nextStep.type !== 'decision') {
        setTimeout(() => {
          advanceSequence();
        }, nextStep.duration);
      }
    } else {
      // End of sequence
      setTimeout(() => {
        setIsVisible(false);
        if (onComplete) {
          onComplete();
        }
      }, 1000);
    }
  }, [endingManager, onComplete]);

  // Handle option selection for decision steps
  const handleOptionSelect = useCallback((index: number) => {
    setSelectedOption(index);
  }, []);

  // Handle confirming a decision
  const handleDecisionConfirm = useCallback(() => {
    if (selectedOption !== null && currentStep?.options?.[selectedOption]) {
      const nextStepId = currentStep.options[selectedOption].nextStep;
      setSelectedOption(null);
      advanceSequence(nextStepId);
    }
  }, [selectedOption, currentStep, advanceSequence]);

  // Initial setup effect
  useEffect(() => {
    if (endingManager.isEndingActive()) {
      const initialStep = endingManager.getCurrentStep();
      if (initialStep) {
        setCurrentStep(initialStep);
        setIsVisible(true);
        
        // Auto advance if not a decision step and has duration
        if (initialStep.duration && initialStep.type !== 'decision') {
          setTimeout(() => {
            advanceSequence();
          }, initialStep.duration);
        }
      }
    }
  }, [endingManager, advanceSequence]);

  // If no active ending or step, don't render
  if (!isVisible || !currentStep) {
    return null;
  }

  // Determine the class names based on the effect
  const sequenceClasses = ['ending-sequence'];
  if (currentStep.effect) {
    sequenceClasses.push(currentStep.effect);
  }

  return (
    <div className={sequenceClasses.join(' ')}>
      <div className="ending-container">
        {currentStep.type === 'text' && (
          <div className="ending-text">
            {currentStep.content.split('\n').map((line, i) => (
              <p key={i}>{line}</p>
            ))}
          </div>
        )}

        {currentStep.type === 'visual' && (
          <div className="ending-visual">
            <img src={`/assets/endings/${currentStep.content}`} alt="Ending visual" />
          </div>
        )}

        {currentStep.type === 'command' && (
          <div className="ending-command">
            {currentStep.content.split('\n').map((line, i) => (
              <div key={i} className="command-line">
                {line.startsWith('> ') ? (
                  <>
                    <span className="prompt">{line.substring(0, 2)}</span>
                    <span>{line.substring(2)}</span>
                  </>
                ) : (
                  <span>{line}</span>
                )}
              </div>
            ))}
          </div>
        )}

        {currentStep.type === 'decision' && (
          <div className="ending-decision">
            <div className="ending-question">
              {currentStep.content}
            </div>
            <div className="ending-options">
              {currentStep.options?.map((option, index) => (
                <button
                  key={index}
                  className={selectedOption === index ? 'selected' : ''}
                  onClick={() => handleOptionSelect(index)}
                >
                  {option.label}
                </button>
              ))}
            </div>
            <button 
              className="confirm-button"
              disabled={selectedOption === null}
              onClick={handleDecisionConfirm}
            >
              Confirm
            </button>
          </div>
        )}

        {currentStep.type === 'glitch' && (
          <div className="ending-glitch">
            <div className="glitch-text" data-text={currentStep.content}>
              {currentStep.content}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
