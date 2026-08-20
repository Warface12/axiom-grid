export type IntegrationConfig = {
  enabled: boolean;
  apiKey?: string;
  apiSecret?: string;
  webhookUrl?: string;
  [key: string]: any;
};

export type SyncResult = {
  status: "success" | "partial" | "failed";
  recordsProcessed: number;
  recordsChanged: number;
  errors: string[];
  message?: string;
  count?: number;
};
export interface DataFeedAdapter {
  provider: string;
  integrationType: "casino" | "affiliate" | "sports";
  fetchRecords(): Promise<unknown[]>;
  normalize(record: unknown): Record<string, unknown> | null;
  validate(record: Record<string, unknown>): string[];
}

export class IntegrationManager {
  private adapters = new Map<string, DataFeedAdapter>();

  register(adapter: DataFeedAdapter) {
    this.adapters.set(`${adapter.provider}:${adapter.integrationType}`, adapter);
  }

  getAdapter(provider: string, type: IntegrationConfig["integration_type"]): DataFeedAdapter | null {
    return this.adapters.get(`${provider}:${type}`) || null;
  }

  async sync(config: IntegrationConfig): Promise<SyncResult> {
    const adapter = this.getAdapter(config.provider, config.integration_type);
    if (!adapter) {
      return { status: "failed", recordsProcessed: 0, recordsChanged: 0, errors: [`No adapter for ${config.provider}:${config.integration_type}`] };
    }

    const errors: string[] = [];
    let recordsProcessed = 0;
    let recordsChanged = 0;

    try {
      const rawRecords = await adapter.fetchRecords();
      for (const raw of rawRecords) {
        recordsProcessed++;
        const normalized = adapter.normalize(raw);
        if (!normalized) {
          errors.push(`Record ${recordsProcessed}: normalization failed`);
          continue;
        }
        const validationErrors = adapter.validate(normalized);
        if (validationErrors.length) {
          errors.push(`Record ${recordsProcessed}: ${validationErrors.join(", ")}`);
          continue;
        }
        recordsChanged++;
      }
    } catch (e) {
      errors.push(e instanceof Error ? e.message : "Unknown sync error");
    }

    return {
      status: errors.length === 0 ? "success" : recordsChanged > 0 ? "partial" : "failed",
      recordsProcessed,
      recordsChanged,
      errors,
    };
  }
}

export const integrationManager = new IntegrationManager();

// Register placeholder adapters — connect real partner APIs by implementing DataFeedAdapter
// and calling integrationManager.register() in a server-only module when credentials are configured.

export function createSyncLogEntry(result: SyncResult, integrationId: string) {
  return {
    integration_id: integrationId,
    status: result.status === "success" ? "success" : result.status === "partial" ? "partial" : "failed",
    records_processed: result.recordsProcessed,
    records_changed: result.recordsChanged,
    errors: result.errors,
    finished_at: new Date().toISOString(),
  };
}
