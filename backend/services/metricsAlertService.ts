/**
 * MetricsAlertService is responsible for monitoring system metrics and triggering alerts
 * when certain thresholds are exceeded. It periodically checks CPU, memory, and disk space usage
 * and notifies administrators via email when issues are detected.
 */
import AlertSystem from '../controllers/alertSystem/alertSystem';

class MetricsAlertService {
  // Instance of AlertSystem to handle alert management and notifications
  private alertSystem: AlertSystem;
  // Reference to the interval timer for periodic metric checks
  private checkInterval: NodeJS.Timeout | null;

  constructor() {
    this.alertSystem = new AlertSystem();
    this.checkInterval = null;
  }

  /**
   * Starts the metrics monitoring process with a specified check interval
   * @param intervalMs - Time between metric checks in milliseconds (default: 60000ms = 1 minute)
   */
  startMonitoring(intervalMs: number = 60000): void {
    if (this.checkInterval) {
      console.warn('Metrics monitoring is already running');
      return;
    }

    // Set up default alert configurations
    this.setupDefaultAlerts();

    // Start periodic checking
    this.checkInterval = setInterval(() => {
      this.checkMetrics();
    }, intervalMs);

    console.log('Metrics monitoring started');
  }

  /**
   * Stops the metrics monitoring process by clearing the interval timer
   */
  stopMonitoring(): void {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
      console.log('Metrics monitoring stopped');
    }
  }

  /**
   * Configures default alert thresholds for system metrics
   * Sets up alerts for CPU usage, memory usage, and disk space
   */
  private setupDefaultAlerts(): void {
    // CPU Usage Alert - Triggers when CPU usage exceeds 80%
    this.alertSystem.addAlert({
      metricName: 'CPU_usage',
      threshold: 80, // 80% CPU usage
      comparison: '>',
      emailRecipients: [process.env.ALERT_EMAIL_RECIPIENTS || 'admin@docketeer.com'],
    });

    // Memory Usage Alert - Triggers when memory usage exceeds 90%
    this.alertSystem.addAlert({
      metricName: 'memory',
      threshold: 0.9, // 90% memory usage
      comparison: '>',
      emailRecipients: [process.env.ALERT_EMAIL_RECIPIENTS || 'admin@docketeer.com'],
    });

    // Disk Space Alert - Triggers when disk space usage exceeds 85%
    this.alertSystem.addAlert({
      metricName: 'diskSpace',
      threshold: 0.85, // 85% disk space usage
      comparison: '>',
      emailRecipients: [process.env.ALERT_EMAIL_RECIPIENTS || 'admin@docketeer.com'],
    });
  }

  /**
   * Performs the actual metrics check by querying Prometheus for current system metrics
   * Checks CPU usage, memory usage, and disk space usage
   * Triggers alerts if any metrics exceed their configured thresholds
   */
  private async checkMetrics(): Promise<void> {
    try {
      const date = new Date().toISOString();
      console.log('Checking metrics at:', date);

      // Define the metrics to check and their corresponding Prometheus queries
      const metrics = [
        {
          metricName: 'diskSpace',
          // Query calculates disk space usage as a ratio of used space to total space
          metricQuery: 'round(sum(container_fs_usage_bytes{job="localprometheus"}) by (container_name) / sum(container_fs_limit_bytes{job="localprometheus"}) by (container_name), 0.001)'
        },
        {
          metricName: 'memory',
          // Query calculates memory usage as a ratio of available memory to total memory
          metricQuery: 'round((1 - (node_memory_MemAvailable_bytes{job="localprometheus"} / node_memory_MemTotal_bytes{job="localprometheus"})), 0.001)'
        },
        {
          metricName: 'CPU_usage',
          // Query calculates CPU usage as a percentage over a 5-minute window
          metricQuery: 'sum(rate(process_cpu_seconds_total{job="localprometheus"}[5m])) * 100'
        }
      ];

      const metricsData: Record<string, number> = {};

      // Fetch each metric from Prometheus
      for (const metric of metrics) {
        console.log(`Fetching ${metric.metricName} metric...`);
        const response = await fetch(
          `http://localhost:49156/api/v1/query?query=${metric.metricQuery}&time=${date}`
        );
        const data = await response.json();

        // Extract and store the metric value if available
        if (data.data && data.data.result && data.data.result[0]) {
          metricsData[metric.metricName] = parseFloat(data.data.result[0].value[1]);
          console.log(`${metric.metricName} value:`, metricsData[metric.metricName]);
        } else {
          console.log(`No data received for ${metric.metricName}`);
        }
      }

      // Check if any metrics exceed their thresholds and trigger alerts if necessary
      console.log('Checking thresholds for metrics:', metricsData);
      await this.alertSystem.checkMetrics(metricsData);
    } catch (error) {
      console.error('Error checking metrics:', error);
    }
  }
}

// Export a singleton instance of the MetricsAlertService
export default new MetricsAlertService(); 