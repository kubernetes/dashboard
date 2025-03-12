import {Component, Input} from '@angular/core';
import {MatTableDataSource} from '@angular/material/table';
import {MatPaginator} from '@angular/material/paginator';
import {MatSort} from '@angular/material/sort';
import {ViewChild} from '@angular/core';

@Component({
  selector: 'kd-environment-variables',
  templateUrl: './template.html',
  styleUrls: ['./style.scss'],
})
export class EnvironmentVariablesComponent {
  @Input() variables: {name: string; value: string}[] = [];
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  displayedColumns: string[] = ['name', 'value'];
  dataSource: MatTableDataSource<{name: string; value: string}>;

  ngOnInit() {
    this.dataSource = new MatTableDataSource(this.variables);
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }
}