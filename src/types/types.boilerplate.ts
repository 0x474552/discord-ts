/**
 * Reference-only examples for adding your own shared project types.
 */
export interface ExampleGuildSettings {
  guildId: string;
  welcomeEnabled: boolean;
}

export interface ExampleAuditEntry {
  action: string;
  createdAt: Date;
}
