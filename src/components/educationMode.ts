import type { EducationStep } from '../types';

export class EducationController {
  private step: EducationStep = 0;
  private paused = false;

  constructor(private readonly applyStep: (step: EducationStep) => void) {}

  start(): void {
    this.paused = false;
    this.step = 0;
    this.applyStep(this.step);
  }

  pause(): void {
    this.paused = true;
  }

  resume(): void {
    this.paused = false;
  }

  isPaused(): boolean {
    return this.paused;
  }

  next(): void {
    if (this.step < 2) {
      this.step = (this.step + 1) as EducationStep;
      this.applyStep(this.step);
    }
  }

  previous(): void {
    if (this.step > 0) {
      this.step = (this.step - 1) as EducationStep;
      this.applyStep(this.step);
    }
  }

  restart(): void {
    this.start();
  }

  getCurrentStep(): EducationStep {
    return this.step;
  }
}

export function createEducationMode(applyStep: (step: EducationStep) => void): EducationController {
  return new EducationController(applyStep);
}
