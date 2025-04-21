import React, { useState } from 'react';
import LensTypeSelector from './LensTypeSelector';
import VerifiedPrescriptions from './VerifiedPrescriptions';
import LensPricingDisplay from './LensPricingDisplay';
import { useAuth } from '../../context/AuthContext';

const LensSelector = ({ onClose, onSelectLens }) => {
  const { token } = useAuth();
  const [selectedType, setSelectedType] = useState(null);
  const [selectedPrescription, setSelectedPrescription] = useState(null);
  const [step, setStep] = useState('type'); // 'type', 'prescription', or 'coating'

  const handleTypeSelect = (type) => {
    setSelectedType(type);
    setSelectedPrescription(null);
  };

  const handleContinue = () => {
    if (!selectedType) {
      alert('Please select a lens type');
      return;
    }
    setStep('prescription');
  };

  const handlePrescriptionSelect = (prescription) => {
    setSelectedPrescription(prescription);
    setStep('coating');
  };

  const handleCoatingSelect = (selection) => {
    onSelectLens({
      type: selectedType.name,
      name: selectedType.name,
      prescription: selectedPrescription,
      coating: selection.coating,
      price: selection.price
    });
    onClose();
  };

  const renderStepIndicator = () => (
    <div className="flex justify-between mb-6">
      {['Lens Type', 'Prescription', 'Coating'].map((stepName, index) => {
        const stepValue = ['type', 'prescription', 'coating'][index];
        const isActive = step === stepValue;
        const isPast = (step === 'prescription' && index === 0) || 
                      (step === 'coating' && index < 2);

        return (
          <div key={stepValue} className="flex items-center">
            <div className={`flex items-center justify-center w-8 h-8 rounded-full 
              ${isActive ? 'bg-blue-600 text-white' : 
                isPast ? 'bg-blue-200 text-blue-800' : 
                'bg-gray-200 text-gray-600'}`}
            >
              {index + 1}
            </div>
            {index < 2 && (
              <div className={`w-24 h-1 mx-2 
                ${isPast ? 'bg-blue-200' : 'bg-gray-200'}`}
              />
            )}
          </div>
        );
      })}
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-8 rounded-lg max-w-5xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">
            {step === 'type' ? 'Select Lens Type' : 
             step === 'prescription' ? 'Select Prescription' : 
             'Select Coating'}
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-xl">
            ✕
          </button>
        </div>

        {renderStepIndicator()}

        {step === 'type' ? (
          <>
            <LensTypeSelector 
              selectedType={selectedType}
              onSelectType={handleTypeSelect}
            />
            <div className="flex justify-end mt-6">
              <button
                onClick={handleContinue}
                disabled={!selectedType}
                className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
              >
                Continue
              </button>
            </div>
          </>
        ) : step === 'prescription' ? (
          <VerifiedPrescriptions
            prescriptionType={selectedType.name}
            onSelectPrescription={handlePrescriptionSelect}
            onBack={() => setStep('type')}
            token={token}
            selectedPrescription={selectedPrescription}
          />
        ) : (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <button
                onClick={() => setStep('prescription')}
                className="text-blue-600 hover:text-blue-700"
              >
                ← Back to Prescriptions
              </button>
            </div>
            <LensPricingDisplay
              prescriptionType={selectedType.name}
              prescription={selectedPrescription}
              onConfirm={handleCoatingSelect}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default LensSelector;