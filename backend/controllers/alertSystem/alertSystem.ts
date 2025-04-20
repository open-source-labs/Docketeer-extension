import nodemailer from 'nodemailer';
import { MailtrapTransport } from 'mailtrap';

/**
 * Interface defining the structure of an alert configuration
 * @property metricName - The name of the metric to monitor (e.g., 'cpu_usage', 'memory_usage')
 * @property threshold - The numerical threshold value to compare against
 * @property comparison - The comparison operator to use ('>' for greater than, '<' for less than, '==' for equal to)
 * @property emailRecipients - Array of email addresses to send alerts to
 */
interface AlertConfig {
  metricName: string;
  threshold: number;
  comparison: '>' | '<' | '==';
  emailRecipients: string[];
}

/**
 * AlertSystem class handles monitoring metrics and sending email alerts when thresholds are exceeded
 * Uses Mailtrap for email delivery in development/testing environments
 */
class AlertSystem {
  private transport: nodemailer.Transporter;
  private alertConfigs: AlertConfig[] = [];

  /**
   * Constructor initializes the email transport using Mailtrap
   * Requires MAILTRAP_TOKEN environment variable to be set
   */
  constructor() {
    // Initialize the email transport with Mailtrap
    this.transport = nodemailer.createTransport(
      MailtrapTransport({
        token: process.env.MAILTRAP_TOKEN,
      })
    );
  }

  /**
   * Adds a new alert configuration to the system
   * @param config - AlertConfig object containing the alert parameters
   */
  addAlert(config: AlertConfig): void {
    this.alertConfigs.push(config);
  }

  /**
   * Checks current metric values against configured thresholds
   * Sends alerts if any thresholds are exceeded
   * @param metrics - Object containing current metric values (e.g., { cpu_usage: 85, memory_usage: 90 })
   */
  async checkMetrics(metrics: Record<string, number>): Promise<void> {
    for (const config of this.alertConfigs) {
      const currentValue = metrics[config.metricName];

      // Skip if the metric is not found in the provided metrics
      if (currentValue === undefined) {
        console.warn(
          `Metric ${config.metricName} not found in provided metrics`
        );
        continue;
      }

      // Determine if an alert should be sent based on the comparison operator
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

      // Send alert if threshold is exceeded
      if (shouldAlert) {
        await this.sendAlert(config, currentValue);
      }
    }
  }

  /**
   * Sends an email alert using the configured email transport
   * @param config - The alert configuration that triggered this alert
   * @param currentValue - The current value of the metric that exceeded the threshold
   */
  private async sendAlert(
    config: AlertConfig,
    currentValue: number
  ): Promise<void> {
    // Configure sender information from environment variables or use defaults
    const sender = {
      address: process.env.MAILTRAP_SENDER_EMAIL || 'alerts@docketeer.com',
      name: process.env.MAILTRAP_SENDER_NAME || 'Docketeer Alert System',
    };

    // Construct email subject and body
    const subject = `Alert: ${config.metricName} threshold exceeded`;
    const text =
      `The metric "${config.metricName}" has exceeded its threshold.\n` +
      `Current value: ${currentValue}\n` +
      `Threshold: ${config.threshold}\n` +
      `Comparison: ${config.comparison}`;

    try {
      // Send the email using the configured transport
      await this.transport.sendMail({
        from: sender,
        to: config.emailRecipients,
        subject: subject,
        text: text,
      });
      console.log(`Alert sent for ${config.metricName}`);
    } catch (error) {
      console.error(`Failed to send alert for ${config.metricName}:`, error);
    }
  }
}

export default AlertSystem;
