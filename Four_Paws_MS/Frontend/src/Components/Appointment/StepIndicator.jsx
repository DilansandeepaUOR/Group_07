import React from "react";

const StepIndicator = ({ 
  steps = ["pet-info", "location", "confirmation", "complete"],
  activeStep,
  stepLabels = ["Pet & Service", "Location", "Confirmation", "Complete"] 
}) => {
  const getStepIndex = (step) => steps.indexOf(step);
  const activeIndex = getStepIndex(activeStep);

  return (
    <div className="mb-6">
      <div className="flex justify-center mb-4">
        <div className="flex items-center">
          {steps.map((step, index) => (
            <React.Fragment key={step}>
              <div 
                className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  activeIndex >= index ? "bg-[#008879] text-white" : "bg-gray-200 text-gray-600"
                }`}
              >
                {index + 1}
              </div>
              {index < steps.length - 1 && (
                <div 
                  className={`w-16 h-1 ${
                    activeIndex > index ? "bg-[#008879]" : "bg-gray-200"
                  }`}
                ></div>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>
      <div className="flex justify-center text-xs md:text-sm gap-3 text-gray-500">
        {steps.map((_, index) => (
          <span 
            key={index} 
            className={`${activeIndex === index ? "font-semibold text-[#008879]" : ""} ${index >= stepLabels.length ? "hidden" : ""}`}
          >
            {index < stepLabels.length ? stepLabels[index] : ""}
          </span>
        ))}
      </div>
    </div>
  );
};

export default StepIndicator;
