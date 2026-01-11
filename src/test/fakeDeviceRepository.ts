import type { Device } from '@/composables/useDevices';

export interface DeviceRepository {
  getAll(): Promise<Device[]>;
  getById(id: string): Promise<Device | null>;
}

/**
 * In-memory fake repository for testing.
 * Provides a simple implementation that can simulate success, failure, and delays.
 */
export class FakeDeviceRepository implements DeviceRepository {
  private data: Device[];
  private shouldFail = false;
  private failureError: Error | null = null;
  private delayMs = 0;

  constructor(initialData: Device[] = []) {
    this.data = [...initialData];
  }

  /**
   * Set the repository to fail on next call.
   */
  simulateFailure(error: Error) {
    this.shouldFail = true;
    this.failureError = error;
  }

  /**
   * Clear the failure state.
   */
  clearFailure() {
    this.shouldFail = false;
    this.failureError = null;
  }

  /**
   * Set a delay for responses (useful for testing loading states).
   */
  setDelay(ms: number) {
    this.delayMs = ms;
  }

  /**
   * Add a device to the repository.
   */
  addDevice(device: Device) {
    this.data.push(device);
  }

  /**
   * Clear all data from the repository.
   */
  clear() {
    this.data = [];
  }

  /**
   * Get all devices.
   */
  async getAll(): Promise<Device[]> {
    if (this.delayMs > 0) {
      await new Promise((resolve) => setTimeout(resolve, this.delayMs));
    }

    if (this.shouldFail) {
      throw this.failureError || new Error('Repository error');
    }

    return [...this.data];
  }

  /**
   * Get a device by ID.
   */
  async getById(id: string): Promise<Device | null> {
    if (this.delayMs > 0) {
      await new Promise((resolve) => setTimeout(resolve, this.delayMs));
    }

    if (this.shouldFail) {
      throw this.failureError || new Error('Repository error');
    }

    return this.data.find((d) => d.id === id) || null;
  }
}
