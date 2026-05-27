import { appLogger } from "../../../infrastructure/logger/app.logger.js";
import { UserRepository } from "../domain/user.repository.js";

type ProfileResponse = {
  id: string;
  email: string;
  full_name: string;
  role: "USER" | "ADMIN";
};

export class GetProfileUseCase {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(id: string): Promise<ProfileResponse> {
    const user = await this.userRepository.findById(id);

    if (!user) {
      throw new Error('User not found');
    }

    appLogger.info(
      {
        userId: user.id,
        email: user.email,
      },
      'User profile retrieved',
    );

    return {
      id: user.id,
      email: user.email,
      full_name: user.full_name,
      role: user.role
    };
  }
}
