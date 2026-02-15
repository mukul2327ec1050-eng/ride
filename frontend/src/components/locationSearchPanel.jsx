import React from 'react';

const LocationSearchPanel = (props) => {
  return (
    <div>
      {props.suggestions.map((suggestion, idx) => (
        <div
          key={idx}
          onClick={() => {
            // ✅ Only update the active field
            if (props.activeField === 'pickup') {
              props.setPickup(suggestion.display_name);
            } else if (props.activeField === 'destination') {
              props.setDestination(suggestion.display_name);
            }

            // ❌ Do NOT close the panel
            // ❌ Do NOT open vehicle panel
          }}
          className="flex gap-4 items-center justify-start p-2 mt-4 cursor-pointer hover:bg-gray-100 rounded-lg"
        >
          <h2 className="bg-[#eee] h-8 flex items-center justify-center w-12 rounded-full">
            <i className="ri-map-pin-fill"></i>
          </h2>
          <h4 className="font-medium">{suggestion.display_name}</h4>
        </div>
      ))}
    </div>
  );
};

export default LocationSearchPanel;
