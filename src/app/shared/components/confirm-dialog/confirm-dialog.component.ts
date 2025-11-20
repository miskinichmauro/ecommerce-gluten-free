import { Component, HostListener, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'confirm-dialog',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './confirm-dialog.component.html',
  styleUrl: './confirm-dialog.component.css'
})
export class ConfirmDialogComponent {
  visible = signal(false);
  message = signal('');
  title = signal('Confirmar');
  private resolver?: (value: boolean) => void;

  open(message: string, title = 'Confirmar'): Promise<boolean> {
    this.message.set(message);
    this.title.set(title);
    this.visible.set(true);

    return new Promise<boolean>((resolve) => {
      this.resolver = resolve;
    });
  }

  close(result: boolean) {
    this.visible.set(false);
    if (this.resolver) {
      this.resolver(result);
      this.resolver = undefined;
    }
  }

  @HostListener('document:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    if (!this.visible()) return;

    switch (event.key) {
      case 'Enter':
      case ' ':
        event.preventDefault();
        this.close(true);
        break;
      case 'Escape':
        event.preventDefault();
        this.close(false);
        break;
    }
  }
}
