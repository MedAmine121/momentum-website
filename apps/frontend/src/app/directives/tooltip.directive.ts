import { Tooltip as PTooltip, TooltipStyle } from 'primeng/tooltip';
import {
  Directive,
  Input,
  QueryList,
  TemplateRef,
  input,
  signal
} from '@angular/core';
import { DomHandler } from 'primeng/dom';
import type { TooltipEvent, TooltipPosition } from 'primeng/types/tooltip';

/**
 * Overriden PrimeNG Tooltip directive adding extra utilities for
 * programmatically displaying tooltips.
 *
 * https://primeng.org/tooltip
 * https://github.com/primefaces/primeng/blob/master/packages/primeng/src/tooltip/tooltip.ts
 */
@Directive({
  selector: '[mTooltip]',
  host: { class: 'p-element' },
  standalone: true,
  providers: [TooltipStyle]
})
export class TooltipDirective extends PTooltip {
  /**
   * Event to show the tooltip.
   * If any string other than 'hover' or 'focus' are given, it won't register
   * event listeners.
   *
   * @default hover
   */
  override tooltipEvent = input<TooltipEvent | 'noop' | any>('hover');

  /**
   * Content of the tooltip.
   */
  override content = input<string | TemplateRef<HTMLElement> | undefined>(
    undefined,
    { alias: 'mTooltip' }
  );

  /**
   * String by which to distuingish multiple instances in a QueryList
   */
  @Input() tooltipContext?: any;

  /**
   * Overriden position to make `top` the default.
   */
  override tooltipPosition = input<TooltipPosition | undefined>('top');

  private readonly dynamicContent = signal<string | null>(null);

  override getOption(option: string) {
    if (option === 'tooltipLabel') {
      return this.dynamicContent() ?? super.getOption(option);
    }
    return super.getOption(option);
  }

  override alignTop() {
    this.preAlign('top');

    const viewport = DomHandler.getViewport();
    const hostOffset = this.getHostOffset();
    const tooltipWidth = this.getBoxWidth(this.container);

    let offsetLeft =
      (this.getBoxWidth(this.el.nativeElement) - tooltipWidth) / 2;
    const offsetTop = DomHandler.getOuterHeight(this.container);

    if (hostOffset.left + offsetLeft < 0) {
      offsetLeft = 0;
    }

    if (hostOffset.left + offsetLeft + tooltipWidth > viewport.width) {
      offsetLeft = viewport.width - tooltipWidth - hostOffset.left;
    }

    this.alignTooltip(Math.floor(offsetLeft), -offsetTop);

    const arrowElement = this.getArrowElement();
    arrowElement.style.top = null;
    arrowElement.style.right = null;
    arrowElement.style.bottom = '0';
    arrowElement.style.left = this.getParentCenterOffset() + 'px';
  }

  override alignBottom() {
    this.preAlign('bottom');

    const viewport = DomHandler.getViewport();
    const hostOffset = this.getHostOffset();
    const tooltipWidth = this.getBoxWidth(this.container);

    let offsetLeft =
      (this.getBoxWidth(this.el.nativeElement) - tooltipWidth) / 2;
    const offsetTop = DomHandler.getOuterHeight(this.el.nativeElement);

    if (hostOffset.left + offsetLeft < 0) {
      offsetLeft = 0;
    }

    if (hostOffset.left + offsetLeft + tooltipWidth > viewport.width) {
      offsetLeft = viewport.width - tooltipWidth - hostOffset.left;
    }

    this.alignTooltip(Math.floor(offsetLeft), offsetTop);

    const arrowElement = this.getArrowElement();
    arrowElement.style.top = '0';
    arrowElement.style.right = null;
    arrowElement.style.bottom = null;
    arrowElement.style.left = this.getParentCenterOffset() + 'px';
  }

  override alignLeft() {
    super.alignLeft();
    this.resetArrowOffset();
  }

  override alignRight() {
    super.alignRight();
    this.resetArrowOffset();
  }

  private getParentCenterOffset() {
    const parent = this.el.nativeElement;
    const parrentOffset = DomHandler.getOffset(parent);
    const parentWidth = DomHandler.getOuterWidth(parent);
    const tootltipOffset = DomHandler.getOffset(this.container);
    return parentWidth / 2 + parrentOffset.left - tootltipOffset.left;
  }

  private resetArrowOffset() {
    const arrowElement = this.getArrowElement();
    arrowElement.style.top = null;
    arrowElement.style.right = null;
    arrowElement.style.bottom = null;
    arrowElement.style.left = null;
  }

  private getBoxWidth(el: HTMLElement) {
    return el.getBoundingClientRect().width;
  }

  override getArrowElement() {
    return DomHandler.findSingle(this.container, '.p-tooltip-arrow');
  }

  /**
   * Pick out a specific tooltip from a @ViewChildren querylist based on some
   * property.
   */
  static findByContext(
    tooltips: QueryList<TooltipDirective>,
    context: any
  ): TooltipDirective | undefined {
    return tooltips.find((t) => t.tooltipContext === context);
  }

  /**
   * Set the contents of a tooltip and show it. Duration sets a limit period,
   * if just `true` is given, shows for 2s.
   */
  setAndShow(content: string, duration?: number | true): void {
    this.dynamicContent.set(content);
    this.show();

    // Not messing with underlying tooltipOptions.life stuff, badly documented
    // and can't get to work well.
    if (duration)
      setTimeout(
        () => {
          this.hide();
          this.dynamicContent.set(null);
        },
        duration === true ? 2000 : duration
      );
  }
}
