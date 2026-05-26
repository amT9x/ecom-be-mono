import { User } from "../domain/user.entity.js";
import { UserRepository } from "../domain/user.repository.js";

type Input = {
  id: string;
  body: {
    email: string;
    full_name: string;
  }
};

type UpdateProfileResponse = {
  id: string;
  email: string;
  full_name: string;
  role: "USER" | "ADMIN";
  created_at: Date;
};

export class UpdateProfileUsecase {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(input: Input): Promise<UpdateProfileResponse> {
    const {id, body} = input;
    const user = await this.userRepository.findById(id);

    if (!user) {
      throw new Error('User not found');
    }

    const updatedUser = await this.userRepository.update(
      id,
      {
        email: body.email,
        full_name: body.full_name,
      }
    );

    return {
      id: updatedUser.id,
      email: updatedUser.email,
      full_name: updatedUser.full_name,
      role: updatedUser.role,
      created_at: updatedUser.created_at,
    };
  }
}
