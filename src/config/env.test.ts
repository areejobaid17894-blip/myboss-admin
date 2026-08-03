import { describe, it, expect } from 'vitest';
import { env } from '@/config/env';

describe('env config', () => {
  it('should have auth API URL configured', () => {
    expect(env.authApiUrl).toBeDefined();
    expect(env.authApiUrl.length).toBeGreaterThan(0);
  });

  it('should have user API URL configured', () => {
    expect(env.userApiUrl).toBeDefined();
  });

  it('should have config API URL configured', () => {
    expect(env.configApiUrl).toBeDefined();
  });

  it('should have survey API URL configured', () => {
    expect(env.surveyApiUrl).toBeDefined();
  });

  it('should have squad API URL configured', () => {
    expect(env.squadApiUrl).toBeDefined();
  });
});
