import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReportesUser } from './reportes-user';

describe('ReportesUser', () => {
  let component: ReportesUser;
  let fixture: ComponentFixture<ReportesUser>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReportesUser]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReportesUser);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
