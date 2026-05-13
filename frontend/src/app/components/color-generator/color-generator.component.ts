import { Component, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, FormControl, Validators } from '@angular/forms';
import { CreateColorSchemeInput } from '../../models/color-scheme.model';

@Component({
  selector: 'app-color-generator',
  templateUrl: './color-generator.component.html',
  styleUrls: ['./color-generator.component.scss']
})
export class ColorGeneratorComponent {
  @Output() createScheme = new EventEmitter<CreateColorSchemeInput>();

  colorForm: FormGroup;
  isGenerating = false;

  constructor(private fb: FormBuilder) {
    this.colorForm = this.fb.group({
      name: ['', Validators.required],
      description: [''],
      colors: this.fb.array([
        new FormControl('#FF6B6B'),
        new FormControl('#4ECDC4'),
        new FormControl('#45B7D1')
      ]),
      isFavorite: [false],
      isTemplate: [false]
    });
  }

  get colors(): FormArray {
    return this.colorForm.get('colors') as FormArray;
  }

  getColorControl(index: number): FormControl {
    return this.colors.at(index) as FormControl;
  }

  addColor(): void {
    this.colors.push(this.fb.control(this.generateRandomColor()));
  }

  removeColor(index: number): void {
    if (this.colors.length > 2) {
      this.colors.removeAt(index);
    }
  }

  generateRandomColor(): string {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  }

  generateRandomScheme(): void {
    this.isGenerating = true;
    const numColors = Math.floor(Math.random() * 3) + 3;

    while (this.colors.length > 0) {
      this.colors.removeAt(0);
    }

    for (let i = 0; i < numColors; i++) {
      this.colors.push(this.fb.control(this.generateRandomColor()));
    }

    setTimeout(() => {
      this.isGenerating = false;
    }, 500);
  }

  onSubmit(): void {
    if (this.colorForm.valid) {
      const formValue = this.colorForm.value;
      this.createScheme.emit({
        name: formValue.name,
        description: formValue.description,
        colors: formValue.colors,
        isFavorite: formValue.isFavorite,
        isTemplate: formValue.isTemplate
      });
      this.colorForm.reset({
        name: '',
        description: '',
        isFavorite: false,
        isTemplate: false
      });
    }
  }
}
