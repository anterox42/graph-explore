export const transformData = (data) => {

  const addidionalLinksFromAspects = data.concepts
    .map((concept) => {
      if (concept.isAspect === '1') {
        return {
          source: concept.aspectOf,
          target: concept.id,
        };
      }
    })
    .filter((link) => link);

  return {
    nodes: data.concepts.map((concept) => ({
      id: concept.id,
      name: concept.concept,
      value: concept.concept,
      isAspect: concept.isAspect,
    })),
    links: [
      ...data.relations.map((relation) => ({
        target: relation.concept_id,
        source: relation.to_concept_id,
      })),
      ...addidionalLinksFromAspects,
    ],
  };
};
