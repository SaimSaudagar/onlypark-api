import { AuthenticatedUser } from '../../types';

export interface RequestContext {
  user?: AuthenticatedUser;
}
