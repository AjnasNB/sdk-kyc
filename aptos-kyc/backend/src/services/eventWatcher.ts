import { AptosClient } from 'aptos';
import { config } from '../config';
import EventLog from '../db/models/EventLog';

class EventWatcher {
    private client: AptosClient;
    private isRunning: boolean = false;
    private pollInterval: number = 5000; // 5 seconds

    constructor() {
        this.client = new AptosClient(config.aptosNodeUrl);
    }

    start() {
        if (this.isRunning) return;
        this.isRunning = true;
        console.log('👁️ Event Watcher started...');
        this.poll();
    }

    stop() {
        this.isRunning = false;
    }

    private async poll() {
        if (!this.isRunning) return;

        try {
            await this.checkEvents('CredentialRegistry', 'CredentialIssuedEvent');
            await this.checkEvents('CredentialRegistry', 'CredentialRevokedEvent');
            await this.checkEvents('ReputationStore', 'ScoreUpdatedEvent');
            await this.checkEvents('FraudGuard', 'RiskUpdatedEvent');
        } catch (error) {
            console.error('Event polling error:', error);
        }

        setTimeout(() => this.poll(), this.pollInterval);
    }

    private async checkEvents(moduleName: string, eventName: string) {
        try {
            // In a real production system, we would track the last seen sequence number
            // For this demo, we fetch the latest 25 events
            const events = await this.client.getEventsByEventHandle(
                config.aptosRegistryAddress, // Assuming all events are under the registry account for simplicity
                `${config.aptosModuleAddress}::${moduleName}::${moduleName.replace('Registry', 'Store').replace('Guard', 'GuardStore')}`, // Struct name logic
                eventName === 'CredentialIssuedEvent' ? 'issue_events' :
                    eventName === 'CredentialRevokedEvent' ? 'revoke_events' :
                        eventName === 'ScoreUpdatedEvent' ? 'score_events' :
                            eventName === 'RiskUpdatedEvent' ? 'events' : 'events' // Field name logic
            );

            for (const event of events as any[]) {
                const exists = await EventLog.findOne({ version: Number(event.version) });
                if (!exists) {
                    await EventLog.create({
                        type: eventName,
                        module: moduleName,
                        data: event.data,
                        version: Number(event.version),
                        sequenceNumber: Number(event.sequence_number),
                        timestamp: Date.now() // Ideally use block timestamp
                    });
                    console.log(`📝 New Event Logged: ${eventName}`);
                }
            }
        } catch (error) {
            // Ignore errors for now (e.g. if handle doesn't exist yet)
        }
    }
}

export default new EventWatcher();
