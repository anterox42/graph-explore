import { Suspense } from 'react';
import { transformData } from './helpers/transformData';
import DynamicGraph from './DynamicGraph';
import { filterData } from './helpers/filterData';

export const SEMANTIC_PORTAL_API = 'http://semantic-portal.net/api';

async function loadBranch(branch: string) {
  const res = await fetch(`${SEMANTIC_PORTAL_API}/branch/${branch}`);
  return res.json();
}

export default async function Branch({ params: { branch } }: { params: { branch: string } }) {
  const branchData = await loadBranch(branch);

  return (
    <div>
      <Suspense fallback={<span className="text-white">Loading...</span>}>
        <DynamicGraph branchData={transformData(filterData(branchData))} branch={branch} />
      </Suspense>
    </div>
  );
}
