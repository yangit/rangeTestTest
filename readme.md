## Task

Implement a `Range` and `Range Collection` classes.
A pair of integers define a `Range`, for example: `[1, 4]`.
This range includes integers: `1, 2, 3, and 4`.
A range collection is an aggregate of multiple ranges: `[[1, 5], [10, 11], [100, 201]]`

Range collection should have methods
`.add(range)` // adds given range to RangeCollection
`.remove(range)` // removes given range from RangeCollection
`.toArray()` // returns RangeCollection as a nested array [[1,2],[5,6]]
`.getValues()` // returns an array of all the integers in the range i.e. [1,2,3,4,5] for range of [1,5]
`.length` // returns number of numbers in the range (edited) 
Extra credits are given for `.shift()` and `.pop()` methods.

Please run `npm run test` to see which mocha tests are failing and start fixing them one by one.