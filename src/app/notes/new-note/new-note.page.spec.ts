import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NewNotePage } from './new-note.page';

describe('NewNotePage', () => {
  let component: NewNotePage;
  let fixture: ComponentFixture<NewNotePage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NewNotePage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NewNotePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
