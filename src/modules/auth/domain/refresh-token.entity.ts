export class RefreshTokenEntity {
  constructor(
    public readonly id: string,
    public readonly user_id: string,
    public readonly token: string,
    public readonly expires_at: Date,
    public readonly revoked_at: Date | null,
    public readonly created_at: Date,
  ) {}

  isExpired(): boolean {
    return this.expires_at.getTime() < Date.now();
  }

  isRevoked(): boolean {
    return this.revoked_at !== null;
  }
}
