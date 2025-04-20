import nodemailer from 'nodemailer';
import { MailtrapTransport } from 'mailtrap';

interface AlertConfig {
  metricName: string;
  threshold: number;
  comparison: '>' | '<' | '==';
  emailRecipients: string[];
}

class AlertSystem {
  private transport: nodemailer.Transporter;
  private alertConfigs: AlertConfig[] = [];

  constructor() {
    // Initialize the email transport with Mailtrap
    this.transport = nodemailer.createTransport(
      MailtrapTransport({
        token: process.env.MAILTRAP_TOKEN,
      })
    );
  }

  // Add a new alert configuration
  addAlert(config: AlertConfig): void {
    this.alertConfigs.push(config);
  }

  // Check metrics against thresholds and send alerts if needed
  async checkMetrics(metrics: Record<string, number>): Promise<void> {
    for (const config of this.alertConfigs) {
      const currentValue = metrics[config.metricName];
      
      if (currentValue === undefined) {
        console.warn(`Metric ${config.metricName} not found in provided metrics`);
        continue;
      }

      let shouldAlert = false;
      switch (config.comparison) {
        case '>':
          shouldAlert = currentValue > config.threshold;
          break;
        case '<':
          shouldAlert = currentValue < config.threshold;
          break;
        case '==':
          shouldAlert = currentValue === config.threshold;
          break;
      }

      if (shouldAlert) {
        await this.sendAlert(config, currentValue);
      }
    }
  }

  // Send email alert
  private async sendAlert(config: AlertConfig, currentValue: number): Promise<void> {
    const sender = {
      address: process.env.MAILTRAP_SENDER_EMAIL || "alerts@docketeer.com",
      name: process.env.MAILTRAP_SENDER_NAME || "Docketeer Alert System",
    };

    const subject = `Alert: ${config.metricName} threshold exceeded`;
    const text = `The metric "${config.metricName}" has exceeded its threshold.\n` +
                 `Current value: ${currentValue}\n` +
                 `Threshold: ${config.threshold}\n` +
                 `Comparison: ${config.comparison}`;

    try {
      await this.transport.sendMail({
        from: sender,
        to: config.emailRecipients,
        subject: subject,
        text: text
      });
      console.log(`Alert sent for ${config.metricName}`);
    } catch (error) {
      console.error(`Failed to send alert for ${config.metricName}:`, error);
    }
  }
}

export default AlertSystem; 