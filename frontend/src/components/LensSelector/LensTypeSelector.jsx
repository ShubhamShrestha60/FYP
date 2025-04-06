import React from 'react';

const LensTypeSelector = ({ selectedType, onSelectType }) => {
  const lensTypes = [
    { 
      id: 'single',
      name: 'Single Vision', // This exact string should match the database enum
      description: 'Experience crystal-clear vision with our Single Vision lenses, designed for everyday clarity and comfort'
    },
    { 
      id: 'bifocal',
      name: 'Bifocal', // This exact string should match the database enum
      description: 'Enjoy seamless vision with our Bifocal lenses, designed for both near and distance clarity'
    },
    { 
      id: 'progressive',
      name: 'Progressive', // This exact string should match the database enum
      description: 'Experience smooth, multi-distance vision with our Progressive lenses, designed for seamless clarity'
    }
  ];

  return (
    <div className="mb-6">
      <h2 className="text-2xl font-bold text-center mb-8">Choose Your Prescription Type</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {lensTypes.map(type => (
          <button
            key={type.id}
            onClick={() => onSelectType(type)}
            className={`p-6 border-2 rounded-lg text-center hover:border-blue-500 transition-all ${
              selectedType?.id === type.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
            }`}
          >
            <div className="text-4xl mb-3">{type.icon}</div>
            <div className="font-semibold mb-2">{type.name}</div>
            <div className="text-sm text-gray-600">{type.description}</div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default LensTypeSelector;