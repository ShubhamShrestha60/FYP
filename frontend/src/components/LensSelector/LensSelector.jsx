import React, { useState } from 'react';
import LensTypeSelector from './LensTypeSelector';
import VerifiedPrescriptions from './VerifiedPrescriptions';
import { useAuth } from '../../context/AuthContext';

const LensSelector = ({ onClose, onSelectLens }) => {
  const { token } = useAuth();
  const [selectedType, setSelectedType] = useState(null);
  const [step, setStep] = useState('type'); // 'type' or 'prescription'

  const handleTypeSelect = (type) => {
    setSelectedType(type);
  };

  const handleContinue = () => {
    if (!selectedType) {
      alert('Please select a lens type');
      return;
    }
    setStep('prescription');
  };

  const handlePrescriptionSelect = (prescription) => {
    onSelectLens({
      type: selectedType.name, // Change from selectedType.id to selectedType.name
      name: selectedType.name,
      prescription: prescription
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-8 rounded-lg max-w-5xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-end">
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-xl">
            ✕
          </button>
        </div>

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
        ) : (
          <VerifiedPrescriptions
            prescriptionType={selectedType.name}
            onSelectPrescription={handlePrescriptionSelect}
            onBack={() => setStep('type')}
            token={token} // Pass token explicitly
          />
        )}
      </div>
    </div>
  );
};

export default LensSelector;