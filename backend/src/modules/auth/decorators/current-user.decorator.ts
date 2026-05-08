import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { User } from 'src/modules/users/entities/User.entity';

export const CurrentUser = createParamDecorator<User>(
  (data: unknown, cxt: ExecutionContext) => {
    const request = cxt.switchToHttp().getRequest<{ user: User }>();
    return request.user;
  },
);
