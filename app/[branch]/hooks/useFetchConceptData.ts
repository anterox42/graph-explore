'use client';

import { SemanticPortalNode } from '@/app/types/SemanticPortalNode';
import { useEffect, useState } from 'react';

const SUPPORTED_THESIS_CLASSES = ['definition', 'essence'];
const SEMANTIC_PORTAL_API = 'http://semantic-portal.net/api';

const filterThesis = (data: SemanticPortalNode[]) =>
  data.filter((thesis: SemanticPortalNode) => SUPPORTED_THESIS_CLASSES.includes(thesis.class));

const useFetchConceptData = (node: SemanticPortalNode) => {
  const [conceptData, setConceptData] = useState<SemanticPortalNode[] | null>(null);

  useEffect(() => {
    const fetchConceptData = async () => {
      if (!node?.id) return;

      const res = await fetch(`${SEMANTIC_PORTAL_API}/concept/${node.id}/thesis`);
      const parsedData = await res.json();

      setConceptData(filterThesis(parsedData));
    };

    fetchConceptData();
  }, [node]);

  return conceptData;
};

export default useFetchConceptData;
