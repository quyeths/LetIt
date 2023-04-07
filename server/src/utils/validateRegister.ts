import { UsernamePasswordInput } from './UsernamePasswordInput';

export const validateRegister = (options: UsernamePasswordInput) => {
  if (!options.email.includes('@')) {
    return [
      {
        field: 'email',
        message: 'Email is not valid'
      }
    ];
  }

  if (options.username.length <= 4) {
    return [
      {
        field: 'username',
        message: 'Username must be at least 5 characters'
      }
    ];
  }

  if (options.username.includes('@')) {
    return [
      {
        field: 'username',
        message: 'username cannot contain @'
      }
    ];
  }

  if (options.password.length <= 4) {
    return [
      {
        field: 'password',
        message: 'Password must be at least 5 characters'
      }
    ];
  }

  return null;
};
