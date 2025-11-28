import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'password-toggle',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './password-toggle.component.html',
  styleUrl: './password-toggle.component.css',
})
export class PasswordToggleComponent {
  @Input() visible = false;
  @Output() toggleVisibility = new EventEmitter<void>();

  onToggle() {
    this.toggleVisibility.emit();
  }
}
