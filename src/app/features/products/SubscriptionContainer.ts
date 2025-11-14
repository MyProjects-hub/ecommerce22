import { Subscription } from "rxjs";

export class SubscriptionContainer {
  private subs: Subscription[] = [];

  add(subscription: Subscription): void {
    this.subs.push(subscription);
  }

  dispose(): void {
    this.subs.forEach(subscription => {
      if (subscription && !subscription.closed) {
        subscription.unsubscribe();
      }
    });
    this.subs = [];
  }
}
