import React from 'react';

const DebugInfo = ({ properties, searchTerm, filteredProperties }) => {
  return (
    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
      <h3 className="text-lg font-bold text-yellow-800 mb-2">🔧 DEBUG INFO</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
        <div>
          <strong>Search Term:</strong> "{searchTerm}"<br/>
          <strong>Total Properties:</strong> {properties.length}<br/>
          <strong>Filtered Properties:</strong> {filteredProperties.length}
        </div>
        
        <div>
          <strong>All Properties:</strong>
          <div className="max-h-32 overflow-y-auto mt-1">
            {properties.map((prop, index) => (
              <div key={index} className="text-xs border-b py-1">
                <span className="font-mono">ID: {prop.id}</span> - 
                <span className="ml-2">{prop.location}</span> - 
                <span className="ml-2">Status: {prop.status || 'undefined'}</span>
              </div>
            ))}
          </div>
        </div>

        <div>
          <strong>Filtered Properties:</strong>
          <div className="max-h-32 overflow-y-auto mt-1">
            {filteredProperties.map((prop, index) => (
              <div key={index} className="text-xs border-b py-1">
                <span className="font-mono">ID: {prop.id}</span> - 
                <span className="ml-2">{prop.location}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DebugInfo;