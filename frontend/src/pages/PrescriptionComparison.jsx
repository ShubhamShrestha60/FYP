import React from 'react';
import { toast } from 'react-toastify';

const PrescriptionComparison = ({ prescription, lensType }) => {
  const isCompatible = () => {
    if (!prescription || !lensType) return false;

    const maxSphere = Math.max(
      Math.abs(parseFloat(prescription.rightEye.sphere)),
      Math.abs(parseFloat(prescription.leftEye.sphere))
    );

    const maxCylinder = Math.max(
      Math.abs(parseFloat(prescription.rightEye.cylinder)),
      Math.abs(parseFloat(prescription.leftEye.cylinder))
    );

    // Check for single vision lens compatibility
    if (lensType === 'Single Vision') {
      if (maxSphere > 8) {
        toast.error('Sphere power exceeds single vision lens range (max ±8.00)');
        return false;
      }
      if (maxCylinder > 2) {
        toast.error('Cylinder power exceeds single vision lens range (max ±2.00)');
        return false;
      }
      return true;
    }

    // Check for bifocal/progressive lens compatibility
    if (lensType === 'Bifocal' || lensType === 'Progressive') {
      if (maxSphere > 6) {
        toast.error(`Sphere power exceeds ${lensType.toLowerCase()} lens range (max ±6.00)`);
        return false;
      }
      if (maxCylinder > 2) {
        toast.error(`Cylinder power exceeds ${lensType.toLowerCase()} lens range (max ±2.00)`);
        return false;
      }
      if (!prescription.addition) {
        toast.error('Addition power is required for bifocal/progressive lenses');
        return false;
      }
      const addition = parseFloat(prescription.addition);
      if (addition < 0.75 || addition > 4.00) {
        toast.error('Addition power must be between +0.75 and +4.00');
        return false;
      }
      return true;
    }

    return false;
  };

  return (
    <div className="bg-white rounded-lg shadow p-4 mb-4">
      <h3 className="text-lg font-semibold mb-2">Prescription Compatibility</h3>
      {prescription && lensType ? (
        <div>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <h4 className="font-medium">Right Eye</h4>
              <p>Sphere: {prescription.rightEye.sphere}</p>
              <p>Cylinder: {prescription.rightEye.cylinder}</p>
              <p>Axis: {prescription.rightEye.axis}</p>
            </div>
            <div>
              <h4 className="font-medium">Left Eye</h4>
              <p>Sphere: {prescription.leftEye.sphere}</p>
              <p>Cylinder: {prescription.leftEye.cylinder}</p>
              <p>Axis: {prescription.leftEye.axis}</p>
            </div>
          </div>
          {(lensType === 'Bifocal' || lensType === 'Progressive') && (
            <div className="mb-4">
              <h4 className="font-medium">Addition Power</h4>
              <p>{prescription.addition || 'Not specified'}</p>
            </div>
          )}
          <div className={`p-3 rounded ${isCompatible() ? 'bg-green-100' : 'bg-red-100'}`}>
            <p className={`font-medium ${isCompatible() ? 'text-green-700' : 'text-red-700'}`}>
              {isCompatible() 
                ? `Your prescription is compatible with ${lensType.toLowerCase()} lenses`
                : `Your prescription is not compatible with ${lensType.toLowerCase()} lenses`
              }
            </p>
          </div>
        </div>
      ) : (
        <p className="text-gray-500">Please select a lens type to check compatibility</p>
      )}
    </div>
  );
};

export default PrescriptionComparison; 