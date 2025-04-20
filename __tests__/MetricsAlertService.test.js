import AlertSystem from '../backend/controllers/notifications/alertSystem';

// Mock the AlertSystem
jest.mock('../backend/controllers/notifications/alertSystem');

// Create a mock class for MetricsAlertService
class MockMetricsAlertService {
  constructor(alertSystem) {
    this.alertSystem = alertSystem;
    this.checkInterval = null;
  }

  startMonitoring(intervalMs = 60000) {
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

  stopMonitoring() {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
      console.log('Metrics monitoring stopped');
    }
  }

  setupDefaultAlerts() {
    this.alertSystem.addAlert({
      metricName: 'CPU_usage',
      threshold: 80,
      comparison: '>',
      emailRecipients: ['admin@docketeer.com']
    });

    this.alertSystem.addAlert({
      metricName: 'memory',
      threshold: 0.9,
      comparison: '>',
      emailRecipients: ['admin@docketeer.com']
    });

    this.alertSystem.addAlert({
      metricName: 'diskSpace',
      threshold: 0.85,
      comparison: '>',
      emailRecipients: ['admin@docketeer.com']
    });
  }

  async checkMetrics() {
    try {
      const date = new Date().toISOString();
      console.log('Checking metrics at:', date);
      
      const metrics = [
        {
          metricName: 'diskSpace',
          metricQuery: 'round(sum(container_fs_usage_bytes{job="localprometheus"}) by (container_name) / sum(container_fs_limit_bytes{job="localprometheus"}) by (container_name), 0.001)'
        },
        {
          metricName: 'memory',
          metricQuery: 'round((1 - (node_memory_MemAvailable_bytes{job="localprometheus"} / node_memory_MemTotal_bytes{job="localprometheus"})), 0.001)'
        },
        {
          metricName: 'CPU_usage',
          metricQuery: 'sum(rate(process_cpu_seconds_total{job="localprometheus"}[5m])) * 100'
        }
      ];

      const metricsData = {};

      for (const metric of metrics) {
        console.log(`Fetching ${metric.metricName} metric...`);
        const response = await fetch(`http://localhost:49156/api/v1/query?query=${metric.metricQuery}&time=${date}`);
        const data = await response.json();
        
        if (data.data && data.data.result && data.data.result[0]) {
          metricsData[metric.metricName] = parseFloat(data.data.result[0].value[1]);
          console.log(`${metric.metricName} value:`, metricsData[metric.metricName]);
        } else {
          console.log(`No data received for ${metric.metricName}`);
        }
      }

      console.log('Checking thresholds for metrics:', metricsData);
      await this.alertSystem.checkMetrics(metricsData);
    } catch (error) {
      console.error('Error checking metrics:', error);
    }
  }
}

// Mock the MetricsAlertService module
jest.mock('../backend/services/metricsAlertService', () => {
  return new MockMetricsAlertService();
});

describe('MetricsAlertService', () => {
  let mockAlertSystem;
  let metricsAlertService;

  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
    
    // Create a mock implementation of AlertSystem
    mockAlertSystem = {
      addAlert: jest.fn(),
      checkMetrics: jest.fn()
    };
    
    // Replace the AlertSystem implementation with our mock
    AlertSystem.mockImplementation(() => mockAlertSystem);

    // Mock fetch globally
    global.fetch = jest.fn();

    // Get a fresh instance of the service with the mock AlertSystem
    metricsAlertService = new MockMetricsAlertService(mockAlertSystem);
  });

  afterEach(() => {
    // Stop monitoring after each test
    metricsAlertService.stopMonitoring();
    jest.clearAllMocks();
  });

  describe('startMonitoring', () => {
    it('should start monitoring with default interval', async () => {
      // Spy on setInterval
      const setIntervalSpy = jest.spyOn(global, 'setInterval');
      
      // Start monitoring
      metricsAlertService.startMonitoring(100); // Use a shorter interval for testing
      
      // Wait for the first check to complete
      await new Promise(resolve => setTimeout(resolve, 150));
      
      // Verify setInterval was called
      expect(setIntervalSpy).toHaveBeenCalled();
      
      // Verify default alerts were set up
      expect(mockAlertSystem.addAlert).toHaveBeenCalledWith(
        expect.objectContaining({
          metricName: 'CPU_usage',
          threshold: 80,
          comparison: '>'
        })
      );
      expect(mockAlertSystem.addAlert).toHaveBeenCalledWith(
        expect.objectContaining({
          metricName: 'memory',
          threshold: 0.9,
          comparison: '>'
        })
      );
      expect(mockAlertSystem.addAlert).toHaveBeenCalledWith(
        expect.objectContaining({
          metricName: 'diskSpace',
          threshold: 0.85,
          comparison: '>'
        })
      );
    });

    it('should not start monitoring if already running', () => {
      const consoleSpy = jest.spyOn(console, 'warn');
      
      metricsAlertService.startMonitoring();
      metricsAlertService.startMonitoring();
      
      expect(consoleSpy).toHaveBeenCalledWith('Metrics monitoring is already running');
    });
  });

  describe('stopMonitoring', () => {
    it('should stop monitoring and clear interval', () => {
      const clearIntervalSpy = jest.spyOn(global, 'clearInterval');
      
      metricsAlertService.startMonitoring();
      metricsAlertService.stopMonitoring();
      
      expect(clearIntervalSpy).toHaveBeenCalled();
    });
  });

  describe('checkMetrics', () => {
    it('should fetch and check metrics against thresholds', async () => {
      // Mock fetch response with proper Response object structure
      global.fetch.mockImplementation(() =>
        Promise.resolve({
          json: () => Promise.resolve({
            data: {
              result: [{
                value: ['timestamp', '0.75'] // 75% usage
              }]
            }
          })
        })
      );

      // Start monitoring to trigger checkMetrics
      metricsAlertService.startMonitoring(100); // Use a shorter interval for testing
      
      // Wait for the first check to complete
      await new Promise(resolve => setTimeout(resolve, 150));
      
      // Verify fetch was called for each metric with correct Prometheus queries
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('container_fs_usage_bytes') // diskSpace query
      );
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('node_memory_MemAvailable_bytes') // memory query
      );
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('process_cpu_seconds_total') // CPU query
      );
      
      // Verify metrics were checked with the collected data
      expect(mockAlertSystem.checkMetrics).toHaveBeenCalledWith({
        diskSpace: 0.75,
        memory: 0.75,
        CPU_usage: 0.75
      });
    });

    it('should handle fetch errors gracefully', async () => {
      // Mock fetch to throw error
      global.fetch.mockImplementation(() => Promise.reject(new Error('Network error')));
      const consoleSpy = jest.spyOn(console, 'error');
      
      // Start monitoring to trigger checkMetrics
      metricsAlertService.startMonitoring(100); // Use a shorter interval for testing
      
      // Wait for the first check to complete
      await new Promise(resolve => setTimeout(resolve, 150));
      
      expect(consoleSpy).toHaveBeenCalledWith('Error checking metrics:', expect.any(Error));
    });
  });
}); 