import { PasswordService } from "../../../shared/security/password.service.js";
import { User } from "../domain/user.entity.js";
import { UserRepository } from "../domain/user.repository.js";

type Input = {
  email: string;
  password: string;
  full_name: string
};


export class CreateUserUsecase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly passwordService: PasswordService
  ) {}

  async execute(input: Input): Promise<User> {
    const existingUser = await this.userRepository.findByEmail(input.email);

    if (existingUser) {
      throw new Error('Email already exists');
    }

    const password_hash = await this.passwordService.hash(input.password);
    
    const user = await this.userRepository.create({
      email: input.email,
      password_hash,
      full_name: input.full_name,
      role: 'USER',
    })
    return user;
  }
}
