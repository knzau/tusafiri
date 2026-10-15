import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC = Symbol('IS_PUBLIC');

export const Public = (): ReturnType<typeof SetMetadata> => SetMetadata(IS_PUBLIC, true);
