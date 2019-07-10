import assert from 'assert';
import RangeCollection from '../src/rangeCollection';
import Range from '../src/range';

describe('RangeCollection', () => {
  describe('constructor', () => {
    it('new', () => {
      const rc = new RangeCollection();
      assert.deepEqual(rc.toArray(), []);
      assert.deepEqual(rc.length, 0);
      assert.deepEqual(rc.getValues(), []);
    });
    it('copy', () => {
      const rc = new RangeCollection();
      rc.add([1, 5]);
      rc.add([10, 15]);
      const rcPlainArray = rc.toArray();
      assert.deepEqual(new RangeCollection(rcPlainArray).toArray(), rcPlainArray);
    });
    it('wrong api', () => {
      // below we pass an array instead of an array of arrays, that should throw an error.
      assert.throws(() => new RangeCollection([1, 3]), 'error not thrown on wrong api');
    });
  });

  describe('.add', () => {
    it('to empty', () => {
      const rc = new RangeCollection();
      rc.add([1, 5]);
      assert.deepEqual(rc.toArray(), [[1, 5]]);
    });
    it('number', () => {
      const rc = new RangeCollection();
      // fresh
      rc.add(5);
      assert.deepEqual(rc.toArray(), [[5, 5]]);
      // left
      rc.add(6);
      assert.deepEqual(rc.toArray(), [[5, 6]]);

      // right
      rc.add(4);
      assert.deepEqual(rc.toArray(), [[4, 6]]);

      // out
      rc.add(2);
      assert.deepEqual(rc.toArray(), [[2, 2], [4, 6]]);

      // merge
      rc.add(3);
      assert.deepEqual(rc.toArray(), [[2, 6]]);

      // overlap
      rc.add([0, 10]);
      assert.deepEqual(rc.toArray(), [[0, 10]]);

      // overlap multiple
      rc.add([20, 30]);
      rc.add([-10, 40]);
      assert.deepEqual(rc.toArray(), [[-10, 40]]);
    });
    it('edge overlap', () => {
      const rc = new RangeCollection();
      rc.add([5, 10]);
      rc.add([1, 5]);
      assert.deepEqual(rc.toArray(), [[1, 10]]);
    });
    it('RangeCollection add', () => {
      const rc = new RangeCollection();
      rc.add([5, 10]);
      rc.add([15, 20]);
      const rc2 = new RangeCollection();
      rc2.add([11, 14]);
      rc.add(rc2);
      assert.deepEqual(rc.toArray(), [[5, 20]]);
    });
    it('wrong api', () => {
      const rc = new RangeCollection();

      assert.throws(() => rc.add(5, 6), 'error not thrown on wrong api');
      assert.throws(() => rc.add(), 'error not thrown on wrong api');
      assert.throws(() => rc.add([]), 'error not thrown on wrong api');
    });
  });

  describe('.remove', () => {
    it('wrong api', () => {
      const rc = new RangeCollection();
      // can remove from empty collection
      rc.remove(1);
      // can't remove using wrong api
      rc.add([1, 10]);
      assert.throws(() => rc.remove(5, 6), 'error not thrown on wrong api');
      assert.throws(() => rc.remove(), 'error not thrown on wrong api');
    });
    describe('single', () => {
      it('left', () => {
        const rc = new RangeCollection();
        rc.add([5, 10]);
        rc.remove(5);
        assert.deepEqual(rc.toArray(), [[6, 10]]);
      });
      it('right', () => {
        const rc = new RangeCollection();
        rc.add([5, 10]);
        rc.remove(10);
        assert.deepEqual(rc.toArray(), [[5, 9]]);
      });
      it('middle', () => {
        const rc = new RangeCollection();
        rc.add([5, 10]);
        rc.remove(7);
        assert.deepEqual(rc.toArray(), [[5, 6], [8, 10]]);
        // edge leftover
        rc.remove(9);
        assert.deepEqual(rc.toArray(), [[5, 6], [8, 8], [10, 10]]);
      });
      it('under remove', () => {
        const rc = new RangeCollection();
        rc.add([5, 10]);
        rc.remove(4);
        rc.remove(11);
        assert.deepEqual(rc.toArray(), [[5, 10]]);
      });
    });
    describe('multiple', () => {
      it('over overlap', () => {
        const rc = new RangeCollection();
        rc.add([1, 5]);
        rc.remove([0, 10]);
        assert.deepEqual(rc.toArray(), []);
      });

      it('over overlap many', () => {
        const rc = new RangeCollection();
        rc.add([1, 5]);
        rc.add([10, 15]);
        rc.add([20, 35]);
        rc.remove([0, 100]);
        assert.deepEqual(rc.toArray(), []);
      });

      it('exact', () => {
        const rc = new RangeCollection();
        rc.add([1, 10]);
        rc.remove([1, 10]);
        assert.deepEqual(rc.toArray(), []);
      });

      it('overlap left', () => {
        const rc = new RangeCollection();
        // remove overlap left
        rc.add([5, 10]);
        rc.remove([1, 5]);
        assert.deepEqual(rc.toArray(), [[6, 10]]);

        // remove over-overlap left
        rc.remove([1, 7]);
        assert.deepEqual(rc.toArray(), [[8, 10]]);
      });

      it('overlap right', () => {
        const rc = new RangeCollection();
        // remove overlap right
        rc.add([5, 10]);
        rc.remove([10, 20]);
        assert.deepEqual(rc.toArray(), [[5, 9]]);

        // remove over-overlap right
        rc.remove([8, 20]);
        assert.deepEqual(rc.toArray(), [[5, 7]]);
      });
      it('RangeCollection remove', () => {
        const rc = new RangeCollection();
        rc.add([5, 20]);
        const rc2 = new RangeCollection();
        rc2.add([11, 14]);
        rc.remove(rc2);
        assert.deepEqual(rc.toArray(), [[5, 10], [15, 20]]);
      });
    });
  });

  describe('.length', () => {
    it('single', () => {
      const rc = new RangeCollection();
      assert.deepEqual(rc.length, 0);
      rc.add([1, 1]);
      assert.deepEqual(rc.length, 1);
    });
    it('prune', () => {
      const rc = new RangeCollection();
      rc.add([1, 10]);
      assert.deepEqual(rc.length, 10);
      rc.prune();
      assert.deepEqual(rc.length, 0);
    });
    it('two single separate', () => {
      const rc = new RangeCollection();
      assert.deepEqual(rc.length, 0);
      rc.add([1, 1]);
      assert.deepEqual(rc.length, 1);

      rc.add([5, 5]);
      assert.deepEqual(rc.length, 2);
    });
    it('two', () => {
      const rc = new RangeCollection();
      assert.deepEqual(rc.length, 0);
      rc.add(1);
      assert.deepEqual(rc.length, 1);
      rc.add(2);
      assert.deepEqual(rc.length, 2);
    });
    it('multiple', () => {
      const rc = new RangeCollection();
      assert.deepEqual(rc.length, 0);
      rc.add([1, 1]);
      assert.deepEqual(rc.length, 1);
      rc.add([2, 2]);
      assert.deepEqual(rc.length, 2);
      rc.add([1, 5]);
      assert.deepEqual(rc.length, 5);
      rc.add([9, 9]);
      assert.deepEqual(rc.length, 6);
      rc.add([9, 10]);
      assert.deepEqual(rc.length, 7);
    });
  });
  describe('.length constructor', () => {
    it('.length constructor', () => {
      const rc = new RangeCollection([[1, 15]]);
      assert.deepEqual(rc.length, 15);
    });
  });

  describe('small functions', () => {
    it('small functions', () => {
      const rc = new RangeCollection();
      rc.add([1, 10]);
      assert.deepEqual(rc.toArray(), [[1, 10]]);
      assert.deepEqual(rc.length, 10);
      assert.deepEqual(rc.getValues(), [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
    });
  });
  describe('stringification', () => {
    it('.toString', () => {
      const rc = new RangeCollection();
      rc.add([1, 5]);
      rc.add(7);

      assert.deepEqual(rc.toString(), '[[1,5],[7,7]]');
    });
    it('.inspect', () => {
      const rc = new RangeCollection();
      rc.add([1, 5]);
      rc.add(7);

      assert.deepEqual(rc.inspect(), '[[1,5],[7,7]]');
    });
    it('JSON.Stringify', () => {
      const rc = new RangeCollection();
      rc.add([1, 5]);
      rc.add(7);
      assert.deepEqual(JSON.stringify(rc), '[[1,5],[7,7]]');
    });
    it('cast via concatenation', () => {
      const rc = new RangeCollection();
      rc.add([1, 5]);
      rc.add(7);
      assert.deepEqual([rc].join(), '[[1,5],[7,7]]');
    });
    it('.valueOf', () => {
      const rc = new RangeCollection();
      rc.add([1, 5]);
      rc.add(7);
      assert.deepEqual(rc.valueOf(), '[[1,5],[7,7]]');
    });
  });
  describe('.getValues', () => {
    it('.getValues', () => {
      const rc = new RangeCollection();
      rc.add([1, 5]);
      rc.add([7, 8]);
      rc.add(10);
      assert.deepEqual(rc.getValues(), [1, 2, 3, 4, 5, 7, 8, 10]);
    });
  });
  describe('.isOverlapping', () => {
    it('.isOverlapping', () => {
      // touching or not
      assert(!RangeCollection.isOverlapping(new Range([1, 2]), new Range([3, 4])));
      assert(RangeCollection.isOverlapping(new Range([1, 2]), new Range([2, 4])));
      // touching or not reverse
      assert(!RangeCollection.isOverlapping(new Range([3, 4]), new Range([1, 2])));
      assert(RangeCollection.isOverlapping(new Range([2, 4]), new Range([1, 2])));
      // over overlap
      assert(RangeCollection.isOverlapping(new Range([1, 10]), new Range([5, 6])));
      // over overlap reverse
      assert(RangeCollection.isOverlapping(new Range([5, 6]), new Range([1, 10])));
      // same
      assert(RangeCollection.isOverlapping(new Range([1, 10]), new Range([1, 10])));
    });
  });


  describe('.prune()', () => {
    it('.prune()', () => {
      const rc = new RangeCollection();

      rc.add([1, 5]);
      rc.prune();
      assert.deepEqual(rc.toArray(), []);
      rc.add([10, 20]);
      rc.add(1);
      assert.deepEqual(rc.toArray(), [[1, 1], [10, 20]]);
      rc.prune();
      assert.deepEqual(rc.toArray(), []);
    });
  });
  describe('.pop()', () => {
    it('normal', () => {
      const rc = new RangeCollection();
      rc.add([1, 80]); // many
      rc.add([90, 91]); // two
      rc.add([96, 100]); // five
      const startLength = rc.length;
      const popResult = rc.pop(13);

      assert.deepEqual(popResult.toArray(), [[75, 80], [90, 91], [96, 100]]);
      assert.deepEqual(popResult.length, 13);
      assert.deepEqual(rc.length, startLength - 13);
      assert.deepEqual(rc.toArray(), [[1, 74]]);
    });
    it('less', () => {
      const rc = new RangeCollection();
      rc.add([1, 2]); // two
      rc.add([6, 10]); // five

      const popResult = rc.pop(10);
      assert.deepEqual(popResult.toArray(), [[1, 2], [6, 10]]);
      assert.deepEqual(popResult.length, 7);
      assert.deepEqual(rc.length, 0);
      assert.deepEqual(rc.toArray(), []);
    });
    it('nothing', () => {
      const rc = new RangeCollection();
      rc.add([1, 5]);

      const popResult = rc.pop(0);
      assert.deepEqual(popResult.toArray(), []);
      assert.deepEqual(popResult.length, 0);
      assert.deepEqual(rc.length, 5);
      assert.deepEqual(rc.toArray(), [[1, 5]]);
    });
    it('nothing2', () => {
      const rc = new RangeCollection();

      const popResult = rc.pop(10);
      assert.deepEqual(popResult.toArray(), []);
      assert.deepEqual(popResult.length, 0);
      assert.deepEqual(rc.length, 0);
      assert.deepEqual(rc.toArray(), []);
    });
    it('wrong api', () => {
      const rc = new RangeCollection();
      // can remove from empty collection
      rc.add([1, 10]);

      assert.throws(() => rc.pop(-1), 'error not thrown on wrong api');
      assert.throws(() => rc.pop(), 'error not thrown on wrong api');
      assert.throws(() => rc.pop(1.1), 'error not thrown on wrong api');
      assert.throws(() => rc.pop(null), 'error not thrown on wrong api');
    });
    it('bug', () => {
      const rc = new RangeCollection([[10, 14], [30, 34], [50, 54], [70, 74]]);
      assert.deepEqual(rc.toArray(), [[10, 14], [30, 34], [50, 54], [70, 74]]);
      const popResult = rc.pop(5);

      assert.deepEqual(rc.toArray(), [[10, 14], [30, 34], [50, 54]]);
      assert.deepEqual(popResult.toArray(), [[70, 74]]);
    });
  });
  describe('.shift()', () => {
    it('normal', () => {
      const rc = new RangeCollection();
      rc.add([1, 5]); // five
      rc.add([9, 10]); // two
      rc.add([100, 1000]); // many
      const startLength = rc.length;
      const shiftResult = rc.shift(13);
      assert.deepEqual(shiftResult.toArray(), [[1, 5], [9, 10], [100, 105]]);
      assert.deepEqual(shiftResult.length, 13);
      assert.deepEqual(rc.length, startLength - 13);
      assert.deepEqual(rc.toArray(), [[106, 1000]]);
    });
    it('less', () => {
      const rc = new RangeCollection();
      rc.add([1, 5]); // five
      rc.add([9, 10]); // two

      const shiftResult = rc.shift(10);
      assert.deepEqual(shiftResult.toArray(), [[1, 5], [9, 10]]);
      assert.deepEqual(shiftResult.length, 7);
      assert.deepEqual(rc.length, 0);
      assert.deepEqual(rc.toArray(), []);
    });
    it('nothing', () => {
      const rc = new RangeCollection();
      rc.add([1, 5]);

      const shiftResult = rc.shift(0);
      assert.deepEqual(shiftResult.toArray(), []);
      assert.deepEqual(shiftResult.length, 0);
      assert.deepEqual(rc.length, 5);
      assert.deepEqual(rc.toArray(), [[1, 5]]);
    });
    it('nothing2', () => {
      const rc = new RangeCollection();

      const shiftResult = rc.shift(10);
      assert.deepEqual(shiftResult.toArray(), []);
      assert.deepEqual(shiftResult.length, 0);
      assert.deepEqual(rc.length, 0);
      assert.deepEqual(rc.toArray(), []);
    });
    it('wrong api', () => {
      const rc = new RangeCollection();
      // can remove from empty collection
      rc.add([1, 10]);

      assert.throws(() => rc.shift(-1), 'error not thrown on wrong api');
      assert.throws(() => rc.shift(), 'error not thrown on wrong api');
      assert.throws(() => rc.shift(1.1), 'error not thrown on wrong api');
      assert.throws(() => rc.shift(null), 'error not thrown on wrong api');
    });
    it('bug', () => {
      const rc = new RangeCollection([[10, 14], [30, 34], [50, 54], [70, 2986111]]);
      assert.deepEqual(rc.toArray(), [[10, 14], [30, 34], [50, 54], [70, 2986111]]);
      const shiftResult = rc.shift(5);

      assert.deepEqual(rc.toArray(), [[30, 34], [50, 54], [70, 2986111]]);
      assert.deepEqual(shiftResult.toArray(), [[10, 14]]);
    });
  });
});
