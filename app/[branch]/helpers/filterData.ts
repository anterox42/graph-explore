import { SemanticPortalNode } from '@/app/types/SemanticPortalNode';

type SemanticPortalData = any;

const SUPPORTED_RELATIONS_CLASSES = ['c2c-part-of', 'c2c-is-a'];

export const filterData = ({ concepts, relations, didactic }: SemanticPortalData) => ({
  concepts: concepts,
  relations: relations.filter((relation: SemanticPortalNode) =>
    SUPPORTED_RELATIONS_CLASSES.includes(relation.class),
  ),
  didactic,
});
