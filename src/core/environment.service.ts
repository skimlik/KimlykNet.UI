import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

export interface EnvironmentConfig {
  production: boolean;
  backendUrl: string;
  tokenAudience: string;
}

@Injectable({ providedIn: 'root' })
export class EnvironmentService {
  get applicationConfiguration(): EnvironmentConfig {
    return environment;
  }
}
