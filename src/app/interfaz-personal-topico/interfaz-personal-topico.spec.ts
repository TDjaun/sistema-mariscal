import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InterfazPersonalTopico } from './interfaz-personal-topico';

describe('InterfazPersonalTopico', () => {
  let component: InterfazPersonalTopico;
  let fixture: ComponentFixture<InterfazPersonalTopico>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InterfazPersonalTopico]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InterfazPersonalTopico);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
