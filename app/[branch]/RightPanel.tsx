import React from 'react';
import useFetchConceptData from './hooks/useFetchConceptData';

const RightPanel = ({ node }) => {
  const conceptData = useFetchConceptData(node);

  if (!conceptData) return;

  return (
    <div className="absolute top-0 right-0 p-8 w-96 max-h-full overflow-scroll">
      <div className="card w-full rounded p-4">
        <span className="font-bold text-3xl">{node.name}</span>
        {conceptData
          ? conceptData.map((concept) => (
              <div className="p-1" key={concept.id}>
                ({concept?.class}) {concept?.thesis ?? ''}
              </div>
            ))
          : ''}
      </div>
    </div>
  );
};

export default RightPanel;
