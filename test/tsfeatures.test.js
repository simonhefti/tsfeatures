const tsfeatures = require('../src/tsfeatures');

test('indexOfNLargestSmallest', () => {
    var tst = [7,1,2,9,3];
    var res = tsfeatures.indexOfNLargestSmallest(tst);
    console.log(res);
    expect(res.highest[0]).toBe(3);
    expect(res.lowest[0]).toBe(1);
});

test('characteristics', () => {
    var t = [1, 2, 3, 4, 5];
    var r = [0, 10, 5, 0, 0];
    var c = tsfeatures.characteristics(t,r);
    console.log(c);
    expect(c.r_min).toBe(0);
    expect(c.r_max).toBe(10);
    expect(c.r_sum).toBe(15);
    expect(c.r_avg).toBe(3);
    expect(c.mon_0).toBe(1);
    expect(c.mon_1).toBe(2.333333333333333);
    expect(c.ac_top_1).toBe(0);
    expect(c.ac_low_2).toBe(3);
});
