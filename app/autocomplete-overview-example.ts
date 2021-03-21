import { Component, Directive, Input, OnDestroy, OnInit } from "@angular/core";
import { FormControl, NgControl } from "@angular/forms";

import { Observable } from "rxjs/Observable";
import { startWith } from "rxjs/operators/startWith";
import { map } from "rxjs/operators/map";
import { filter, takeUntil } from "rxjs/operators";
import { Subject } from "rxjs";

export class State {
  constructor(
    public name: string,
    public population: string,
    public flag: string
  ) {}
}

@Directive({
  selector: "[eshopDisplayAutoComplete]"
})
export class DisplayAutoCompleteDirective implements OnInit, OnDestroy {
  @Input("eshopDisplayAutoComplete") displayFn: (val: any) => string;
  unsubscribe$ = new Subject<void>();

  constructor(private control: NgControl) {}

  ngOnInit(): void {
    const formControl = this.control.control;

    formControl.valueChanges
      .pipe(
        takeUntil(this.unsubscribe$),
        filter(value => !!value && typeof value === "object")
      )
      .subscribe(value => {
        this.pathValue({
          population: value.population,
          name: value.name
        });
      });

    if (formControl.value) {
      const value = {
        population: formControl.value.population,
        name: formControl.value.name
      };
      formControl.patchValue(value);
    }
  }

  pathValue(value): void {
    const formControl = this.control.control as FormControl;
    console.log(formControl);
    console.log(value);

    this.control.valueAccessor.writeValue(this.displayFn(value));
    formControl.patchValue(value, {
      emitEvent: false,
      emitModelToViewChange: false
    });
    console.log(formControl);
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }
}

/**
 * @title Autocomplete overview
 */
@Component({
  selector: "autocomplete-overview-example",
  templateUrl: "autocomplete-overview-example.html",
  styleUrls: ["autocomplete-overview-example.css"]
})
export class AutocompleteOverviewExample {
  stateCtrl: FormControl;
  filteredStates: Observable<any[]>;

  states: State[] = [
    {
      name: "Arkansas",
      population: "2.978M",
      // https://commons.wikimedia.org/wiki/File:Flag_of_Arkansas.svg
      flag:
        "https://upload.wikimedia.org/wikipedia/commons/9/9d/Flag_of_Arkansas.svg"
    },
    {
      name: "California",
      population: "39.14M",
      // https://commons.wikimedia.org/wiki/File:Flag_of_California.svg
      flag:
        "https://upload.wikimedia.org/wikipedia/commons/0/01/Flag_of_California.svg"
    },
    {
      name: "Florida",
      population: "20.27M",
      // https://commons.wikimedia.org/wiki/File:Flag_of_Florida.svg
      flag:
        "https://upload.wikimedia.org/wikipedia/commons/f/f7/Flag_of_Florida.svg"
    },
    {
      name: "Texas",
      population: "27.47M",
      // https://commons.wikimedia.org/wiki/File:Flag_of_Texas.svg
      flag:
        "https://upload.wikimedia.org/wikipedia/commons/f/f7/Flag_of_Texas.svg"
    }
  ];

  constructor() {
    this.stateCtrl = new FormControl();
    this.filteredStates = this.stateCtrl.valueChanges.pipe(
      startWith(""),
      map(state => {
        if (typeof state === "string") {
          console.log(state);
          return state ? this.filterStates(state) : this.states.slice();
        }
      })
    );
  }

  filterStates(name: string) {
    return this.states.filter(
      state => state.name.toLowerCase().indexOf(name.toLowerCase()) === 0
    );
  }

  displayCodeAndName = value =>
    value ? `${value.population}-${value.name}` : "";
}

/**  Copyright 2017 Google Inc. All Rights Reserved.
    Use of this source code is governed by an MIT-style license that
    can be found in the LICENSE file at http://angular.io/license */
