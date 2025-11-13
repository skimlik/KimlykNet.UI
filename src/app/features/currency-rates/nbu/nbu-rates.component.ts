import { AfterViewInit, Component, effect, inject, signal, viewChild } from '@angular/core';
import { NbuService } from './nbu.service';
import { NbuCurrency } from './nbu-currency.model';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatSort, MatSortModule } from '@angular/material/sort';

@Component({
  selector: 'app-nbu-rates',
  standalone: true,
  templateUrl: 'nbu-rates.component.html',
  styleUrl: 'nbu-rates.component.scss',
  imports: [MatFormFieldModule, MatInput, MatTableModule, MatSortModule],
})
export class NbuRatesComponent implements AfterViewInit {
  private _service = inject(NbuService);
  private matSort = viewChild.required<MatSort>(MatSort);

  protected displayedColumns = ['txt', 'cc', 'rate', 'exchangedate'];
  protected dataSource = new MatTableDataSource<NbuCurrency>();

  constructor() {
    this.refresh();
  }

  ngAfterViewInit(): void {
    this.dataSource.sort = this.matSort();
  }

  refresh(): void {
    this._service.get().subscribe((rates) => {
      this.dataSource.data = rates;
    });
  }

  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filterPredicate = (data, filter) => {
      const searchText = filter.toLowerCase();
      return (
        data.cc.toLowerCase().includes(searchText) || data.txt.toLowerCase().includes(searchText)
      );
    };
    this.dataSource.filter = filterValue.trim();
  }
}
