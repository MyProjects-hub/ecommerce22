import { DebugElement } from '@angular/core';
import { ComponentFixture } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

/**
 * Test helper utilities for Angular testing
 */

/**
 * Find element by CSS selector
 */
export function findByCss<T>(fixture: ComponentFixture<T>, selector: string): DebugElement {
  return fixture.debugElement.query(By.css(selector));
}

/**
 * Find all elements by CSS selector
 */
export function findAllByCss<T>(fixture: ComponentFixture<T>, selector: string): DebugElement[] {
  return fixture.debugElement.queryAll(By.css(selector));
}

/**
 * Get native element by CSS selector
 */
export function getNativeElement<T>(fixture: ComponentFixture<T>, selector: string): HTMLElement {
  const debugElement = findByCss(fixture, selector);
  return debugElement ? debugElement.nativeElement : null;
}

/**
 * Trigger click event on element
 */
export function clickElement<T>(fixture: ComponentFixture<T>, selector: string): void {
  const element = getNativeElement(fixture, selector);
  if (element) {
    element.click();
    fixture.detectChanges();
  }
}

/**
 * Set input value and trigger input event
 */
export function setInputValue<T>(
  fixture: ComponentFixture<T>,
  selector: string,
  value: string
): void {
  const input = getNativeElement(fixture, selector) as HTMLInputElement;
  if (input) {
    input.value = value;
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();
  }
}

/**
 * Get text content of element
 */
export function getTextContent<T>(fixture: ComponentFixture<T>, selector: string): string {
  const element = getNativeElement(fixture, selector);
  return element ? element.textContent?.trim() || '' : '';
}

/**
 * Check if element exists
 */
export function elementExists<T>(fixture: ComponentFixture<T>, selector: string): boolean {
  return !!findByCss(fixture, selector);
}

/**
 * Wait for async operations to complete
 */
export async function waitForAsync(): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, 0));
}

/**
 * Mock localStorage for testing
 */
export class MockLocalStorage {
  private store: { [key: string]: string } = {};

  getItem(key: string): string | null {
    return this.store[key] || null;
  }

  setItem(key: string, value: string): void {
    this.store[key] = value;
  }

  removeItem(key: string): void {
    delete this.store[key];
  }

  clear(): void {
    this.store = {};
  }

  get length(): number {
    return Object.keys(this.store).length;
  }

  key(index: number): string | null {
    const keys = Object.keys(this.store);
    return keys[index] || null;
  }
}

/**
 * Create a spy object with methods
 */
export function createSpyObj<T>(baseName: string, methodNames: string[]): jasmine.SpyObj<T> {
  const obj: any = {};
  methodNames.forEach(name => {
    obj[name] = jasmine.createSpy(name);
  });
  return obj as jasmine.SpyObj<T>;
}
