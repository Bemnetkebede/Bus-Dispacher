import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from '@prisma/client';
import { ROLES_KEY } from '../decorators/roles.decorator.js';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // 1. Find out what roles this specific route requires
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // 2. If the route has no @Roles() decorator, allow access
    if (!requiredRoles) {
      return true;
    }

    // 3. Get the user from the JWT payload
    const { user } = context.switchToHttp().getRequest();

    // 4. If there is no user, or they don't have a role, reject them
    if (!user || !user.role) {
      throw new ForbiddenException('Authentication required');
    }

    // 5. Check if the user's role exists in the requiredRoles array
    const hasRole = requiredRoles.includes(user.role);
    
    if (!hasRole) {
      throw new ForbiddenException(`Access denied. Requires one of these roles: ${requiredRoles.join(', ')}`);
    }

    return true;
  }
}