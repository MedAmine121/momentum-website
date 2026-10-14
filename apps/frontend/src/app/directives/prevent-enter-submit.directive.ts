import { Directive, HostListener } from '@angular/core';

@Directive({
  selector: 'form[mPreventEnterSubmit]',
  standalone: true
})
export class PreventEnterSubmitDirective {
  @HostListener('keydown.enter', ['$event'])
  onKeyDown(event: KeyboardEvent): void {
    event.preventDefault();
  }
}
