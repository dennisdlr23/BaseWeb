import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CategoriasDialogComponent } from './categorias-dialog.component';

describe('CategoriasDialogComponent', () => {
  let component: CategoriasDialogComponent;
  let fixture: ComponentFixture<CategoriasDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CategoriasDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CategoriasDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
