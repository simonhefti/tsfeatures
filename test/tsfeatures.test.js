const tsfeatures = require('../src/tsfeatures');

test('indexOfNLargestSmallest', () => {
    var tst = [7, 1, 2, 9, 3];
    var res = tsfeatures.indexOfNLargestSmallest(tst);
    console.log(res);
    expect(res.highest[0]).toBe(3);
    expect(res.lowest[0]).toBe(1);
});

test('characteristics', () => {
    var t = [1, 2, 3, 4, 5];
    var r = [0, 10, 5, 0, 0];
    var c = tsfeatures.characteristics(t, r);
    console.log(c);
    expect(c.r_min).toBe(0);
    expect(c.r_max).toBe(10);
    expect(c.r_sum).toBe(15);
    expect(c.r_avg).toBe(3);
    expect(c.mon_0).toBe(1);
    expect(c.mon_1).toBe(2.333333333333333);
    expect(c.ac_top_1_idx).toBe(0);
    expect(c.ac_low_2_idx).toBe(3);
    expect(c.r_above_avg_cnt).toBe(2);
    expect(c.r_below_avg_cnt).toBe(3);
});

test('characteristics 2', () => {

    var t = [];
    for (var i = 0; i < 101; i++) {
        t.push(i);
    }
    var r = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 3, 4, 0, 5, 2, 5, 4, 2, 4, 5, 8, 6, 6, 3, 1, 4, 2, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

    var c = tsfeatures.characteristics(t, r);
    console.log(c);

    expect(c.r_sum).toBe(68);
    expect(c.ac_low_4_idx).toBe(18);
});

test('deal with string input', () => {
    var t = [1, 2, 3, 4, 5];
    var r = ["0", "10", "5", "0", "0"];
    var c = tsfeatures.characteristics(t, r);
    console.log(c);
    expect(c.r_min).toBe(0);
    expect(c.r_max).toBe(10);
    expect(c.r_sum).toBe(15);
    expect(c.r_avg).toBe(3);
    expect(c.mon_0).toBe(1);
    expect(c.mon_1).toBe(2.333333333333333);
    expect(c.ac_top_1_idx).toBe(0);
    expect(c.ac_low_2_idx).toBe(3);
    expect(c.r_above_avg_cnt).toBe(2);
    expect(c.r_below_avg_cnt).toBe(3);
});