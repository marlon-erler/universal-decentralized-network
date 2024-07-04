export class TwoWayMap<A, B> {
  private mapAtoB = new Map<A, Set<B>>();
  private mapBtoA = new Map<B, Set<A>>();

  // prepare
  private prepareA(a: A) {
    if (this.mapAtoB.has(a)) return;
    this.mapAtoB.set(a, new Set());
  }

  private prepareB(b: B) {
    if (this.mapBtoA.has(b)) return;
    this.mapBtoA.set(b, new Set());
  }

  // utility
  private getListOnA(a: A) {
    return this.mapAtoB.get(a);
  }

  private getListOnB(b: B) {
    return this.mapBtoA.get(b);
  }

  // public
  set(a: A, b: B) {
    this.prepareA(a);
    this.prepareB(b);

    this.getListOnA(a)?.add(b);
    this.getListOnB(b)?.add(a);
  }

  delete(a: A, b: B) {
    this.getListOnA(a)?.delete(b);
    this.getListOnB(b)?.delete(a);
  }
}
