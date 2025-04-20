/**
 * Alert System Example
 * This file demonstrates how to use the AlertSystem class to set up and test metric-based alerts.
 * 
 * To run this example:
 * 1. Make sure you have set up your environment variables in .env file:
 *    - ALERT_EMAIL_RECIPIENTS: Comma-separated list of email addresses
 *    - SMTP_HOST: Your SMTP server host
 *    - SMTP_PORT: SMTP server port
 *    - SMTP_USER: SMTP username
 *    - SMTP_PASS: SMTP password
 * 
 * 2. Run the example:
 *    ```bash
 *    ts-node backend/controllers/alertSystem/alertExample.ts
 *    ```
 */

import 'dotenv/config';
import AlertSystem from './alertSystem';

// Create an instance of the alert system
const alertSystem = new AlertSystem();

/**
 * Example 1: Set up CPU usage alert
 * This alert will trigger when CPU usage exceeds 80%
 * The alert will be sent to the specified email recipients
 */
alertSystem.addAlert({
  metricName: 'cpu_usage',
  threshold: 80, // 80% CPU usage
  comparison: '>',
  emailRecipients: [
    process.env.ALERT_EMAIL_RECIPIENTS || 'arthurjin1998@gmail.com',
  ],
});

/**
 * Example 2: Set up Memory usage alert
 * This alert will trigger when memory usage exceeds 90%
 * The alert will be sent to the same email recipients
 */
alertSystem.addAlert({
  metricName: 'memory_usage',
  threshold: 90, // 90% memory usage
  comparison: '>',
  emailRecipients: [
    process.env.ALERT_EMAIL_RECIPIENTS || 'arthurjin1998@gmail.com',
  ],
});

/**
 * Example: Simulate checking metrics
 * This object represents the current system metrics
 * - cpu_usage: 85% (will trigger an alert as it's > 80%)
 * - memory_usage: 75% (won't trigger an alert as it's < 90%)
 */
const metrics = {
  cpu_usage: 85, // This will trigger an alert
  memory_usage: 75, // This won't trigger an alert
};

/**
 * Check the metrics against the defined alerts
 * This will:
 * 1. Compare each metric against its threshold
 * 2. Send email alerts if thresholds are exceeded
 * 3. Log the results to console
 */
alertSystem
  .checkMetrics(metrics)
  .then(() => console.log('Metrics check completed'))
  .catch((error) => console.error('Error checking metrics:', error));
