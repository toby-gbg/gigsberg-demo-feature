import EntityMetadata from '@/interfaces/entity/EntityMetadata';
import PerformerMetadata from '@/interfaces/performers/PerformerMetadata';

export const isPerformerMetadata = (entityMetadata: unknown): entityMetadata is PerformerMetadata =>
    typeof (entityMetadata as PerformerMetadata | null)?.performerName === 'string';

export const isEntityMetadata = (entityMetadata: unknown): entityMetadata is EntityMetadata =>
    typeof (entityMetadata as EntityMetadata | null)?.entity?.name === 'string';
