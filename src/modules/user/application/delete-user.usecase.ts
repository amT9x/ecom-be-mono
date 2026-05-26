import { User } from "../domain/user.entity.js"
import { UserRepository } from "../domain/user.repository.js"

export class DeleteUserUsecase {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(id: string): Promise<User> {
    const user = await this.userRepository.findById(id);

    if (!user) {
      throw new Error('User not found');
    }

    await this.userRepository.delete(id);

    return user;
  }
}
