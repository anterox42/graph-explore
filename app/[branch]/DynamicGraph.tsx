import React from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';

const DynamicGraphComponent = dynamic(() => import('./GraphComponent'), {
  ssr: false,
});

function DynamicGraph({ branchData, branch }) {
  return (
    <>
      <Link className="absolute top-0 left-0 text-white z-50 p-4 text-2xl" href="/">Home</Link>
      <DynamicGraphComponent data={branchData} branch={branch} />
    </>
  );
}

export default DynamicGraph;
