import 'dotenv/config';
import AlertSystem from './alertSystem';

// Create an instance of the alert system
const alertSystem = new AlertSystem();

// Example: Set up alerts for different metrics
alertSystem.addAlert({
  metricName: 'cpu_usage',
  threshold: 80, // 80% CPU usage
  comparison: '>',
  emailRecipients: [process.env.ALERT_EMAIL_RECIPIENTS || 'arthurjin1998@gmail.com']
});

alertSystem.addAlert({
  metricName: 'memory_usage',
  threshold: 90, // 90% memory usage
  comparison: '>',
  emailRecipients: [process.env.ALERT_EMAIL_RECIPIENTS || 'arthurjin1998@gmail.com']
});

// Example: Simulate checking metrics
const metrics = {
  cpu_usage: 85,    // This will trigger an alert
  memory_usage: 75, // This won't trigger an alert
};

// Check the metrics
alertSystem.checkMetrics(metrics)
  .then(() => console.log('Metrics check completed'))
  .catch(error => console.error('Error checking metrics:', error)); 