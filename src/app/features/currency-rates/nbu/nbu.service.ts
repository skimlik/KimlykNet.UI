import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { NbuCurrency } from './nbu-currency.model';

@Injectable({ providedIn: 'root' })
export class NbuService {
  private http = inject(HttpClient);

  get(): Observable<NbuCurrency[]> {
    return this.http.get<NbuCurrency[]>(
      'https://bank.gov.ua/NBUStatService/v1/statdirectory/exchange?json',
    );
  }
}
