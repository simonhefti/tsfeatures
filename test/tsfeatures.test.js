import LM from 'ml-levenberg-marquardt';
const tsfeatures = require('../src/tsfeatures');

// test('indexOfNLargestSmallest', () => {
//     var tst = [7, 1, 2, 9, 3];
//     var res = tsfeatures.indexOfNLargestSmallest(tst);
//     // console.log(res);
//     expect(res.highest[0]).toBe(3);
//     expect(res.lowest[0]).toBe(1);
// });

test('characteristics', () => {
    console.log("characteristics");
    var t = [1, 2, 3, 4, 5];
    var r = [0, 10, 5, 0, 0];
    var c = tsfeatures.characteristics(t, r);
    // console.log(c);
    expect(c.r_mms.min).toBe(0);
    expect(c.r_mms.max).toBe(10);
    expect(c.r_mms.sum).toBe(15);
    expect(c.r_mms.avg).toBe(3);
    expect(c.mon_0).toBe(1);
    expect(c.mon_1).toBe(2.333333333333333);
    // expect(c.ac_top_1_idx).toBe(0);
    // expect(c.ac_low_2_idx).toBe(3);
    expect(c.r_above_avg_cnt).toBe(2);
    expect(c.r_below_avg_cnt).toBe(3);
});

test('characteristics 2', () => {
    console.log("characteristics 2");

    var t = [];
    for (var i = 0; i < 101; i++) {
        t.push(i);
    }
    var r = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 3, 4, 0, 5, 2, 5, 4, 2, 4, 5, 8, 6, 6, 3, 1, 4, 2, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

    var c = tsfeatures.characteristics(t, r);
    // console.log(c);

    expect(c.r_mms.sum).toBe(68);
    // expect(c.ac_low_4_idx).toBe(18);
});

test('deal with string input', () => {
    console.log("deal with string input");

    var t = [1, 2, 3, 4, 5];
    var r = ["0", "10", "5", "0", "0"];
    var c = tsfeatures.characteristics(t, r);
    // console.log(c);
    expect(c.r_mms.min).toBe(0);
    expect(c.r_mms.max).toBe(10);
    expect(c.r_mms.sum).toBe(15);
    expect(c.r_mms.avg).toBe(3);
    expect(c.mon_0).toBe(1);
    expect(c.mon_1).toBe(2.333333333333333);
    // expect(c.ac_top_1_idx).toBe(0);
    // expect(c.ac_low_2_idx).toBe(3);
    expect(c.r_above_avg_cnt).toBe(2);
    expect(c.r_below_avg_cnt).toBe(3);
});

test('linear trend', () => {
    console.log("linear trend");
    var tmp_t = [];
    var tmp_v = [];
    for (var i = 0; i < 5; i++) {
        tmp_t.push(i);
        tmp_v.push(tmp_t[i] * 10 - 3);
    }
    // var lm = ml.levenbergMarquardt({ x: tmp_t, y: tmp_v }, polynomial_1, {
    //     damping: 1.5,
    //     initialValues: [1, 1]
    //   });
    var c = tsfeatures.characteristics(tmp_t, tmp_v);
    console.log(c.lm1);
    var res = false;
    if( c.lm1.parameterValues[0] > -3.1 & c.lm1.parameterValues[0] < -2.9) {
        res = true;
    }
    expect(res).toBe(true);
});

test('quantiles', () => {
    console.log("quantiles");
    var t = [1,2,3];
    var r = [0,1,3];
    var c = tsfeatures.characteristics(t, r);
    // console.log(c.lm1);
    expect(c.r_q_1).toBe(0.5);
});

test('quantiles 2', () => {
    console.log("quantiles 2");
    var r = [7, 20, 16, 6, 58, 9, 20, 50, 23, 33, 8, 10, 15, 16, 104];
    expect(tsfeatures.quantile(r,0)).toBe(6.0);
    expect(tsfeatures.quantile(r,0.25)).toBe(9.5);
    expect(tsfeatures.quantile(r,0.50)).toBe(16.0);
    expect(tsfeatures.quantile(r,0.75)).toBe(28.0);
    expect(tsfeatures.quantile(r,1.0)).toBe(104.0);
});

test('derivative', () => {
    console.log("derivative");
    var t = [1,2,3];
    var r = [0,1,2];
    var d = tsfeatures.derivative(t, r);
    expect(d[0]).toBe(0);
    expect(d[1]).toBe(1);
    expect(d[2]).toBe(1);
});

test('binning', () => {
    console.log("binning");
    var t = [0,1,2,3,4,5,6,7];
    var r = [0,1,2,3,4,5,6,7];
    var c = tsfeatures.characteristics(t,r);
    console.log(c);
    expect(c.r_bin_1).toBe(2);
    expect(c.r_bin_4).toBe(1);
    expect(c.r_bin_5).toBe(2);
});

test('roots', () => {
    console.log("roots");
    var t = [];
    var r = [];
    for (var i = 0; i < 100; i++) {
      t.push(i);
      r.push(Math.sin(i * 0.1));
    }
    var d = tsfeatures.roots(t,r);
    console.log(d);
    expect(d.peak_vals.length > 0).toBe(true);
    expect(d.peak_vals.length === 3).toBe(true);
    expect(d.peak_vals[0]).toBe(0);
    expect(d.peak_idxs[0]).toBe(0);
    expect(d.peak_idxs[1]).toBe(17);
    expect(d.peak_idxs[2]).toBe(48);
});

test('roots 2', () => {

    console.log("roots 2");
    var t = [];
    for (var i = 0; i < 101; i++) {
        t.push(i);
    }
    var r = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 3, 4, 0, 5, 2, 5, 4, 2, 4, 5, 8, 6, 6, 3, 1, 4, 2, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

    var d = tsfeatures.roots(t,r);
    console.log(d);
    expect(d.peak_vals.length > 0).toBe(true);
    expect(d.peak_vals.length === 6).toBe(true);
    expect(d.peak_vals[0]).toBe(0);
    expect(d.peak_idxs[0]).toBe(0);
    expect(d.peak_idxs[1]).toBe(12);
    expect(d.peak_idxs[2]).toBe(16);
});

test('smooth', () => {
    console.log("smooth: test starting");
    var t = [1,2,3,4];
    var r = [0,3,7,0];
    var s = tsfeatures.smooth(t, r, 2);
    console.log(s);
    expect(s[0]).toBe(2.449889558545865);
    expect(s[3]).toBe(2.8422102772677342);
});

test('gaussian', () => {
    var g1 = tsfeatures.gaussian([10, 15, 1]);
    var res = g1(15);
    // console.log(res);
    expect(g1(15)).toBe(3.9894228040143274);
});

test('fit gaussian', () => {
    console.log("fit gaussian");
    var t = [];
    var r = [];
    var g1 = tsfeatures.gaussian([10, 15, 1]);
    for (var i = 0; i < 30; i++) {
      t.push(i);
      r.push(g1(i) + Math.random());
    }
    console.log(r);

    var lm = LM({ x: t, y: r }, tsfeatures.gaussian, {
        damping: 1.5,
        initialValues: [10, 15, 1]
    });

    var c1 = lm.parameterValues[1] > 14.9 && lm.parameterValues[1] < 15.1;

    expect(c1).toBe(true);

    console.log(lm);
});

test('fit lorentzian', () => {
    console.log("fit lorentzian");
    var t = [];
    var r = [];
    var g1 = tsfeatures.asym_lorentzian([10, 15, 1,2]);
    for (var i = 0; i < 50; i++) {
      t.push(i);
      r.push(g1(i) + Math.random());
    }

    var lm = LM({ x: t, y: r }, tsfeatures.asym_lorentzian, {
        damping: 1.5,
        initialValues: [10, 15, 1, 1]
    });

    var c1 = lm.parameterValues[1] > 14.9 && lm.parameterValues[1] < 15.1;

    expect(c1).toBe(true);

    console.log(lm);
});

test('day of year', () => {
    expect(tsfeatures.dayofyear(new Date(2020,0,1))).toBe(1);
    expect(tsfeatures.dayofyear(new Date(2020,0,30))).toBe(30);
    expect(tsfeatures.dayofyear(new Date(2020,1,1))).toBe(32);
});


test('julian day 1.1.2020', () => {

    var o = {includeTime: false};

    expect(tsfeatures.julianday(new Date(2020,0,1,0,0,0,0))).toBe(2458850.0);
    expect(tsfeatures.julianday(new Date(2020,0,1,0,0,0,0), o)).toBe(2458850.0);    
    expect(tsfeatures.julianday(new Date(2020,0,1,2,3,4,5), o)).toBe(2458850.0);    
    expect(tsfeatures.julianday(new Date(2020,3,19,0,0,0,0), o)).toBe(2458959.0);    
});

test('from 2458850 to 1.1.2020', () => {

    var o = {includeTime: false};

    var d1 = tsfeatures.fromJulianDay(2458850);
    expect(d1.getFullYear()).toBe(2020);
    var d2 = tsfeatures.fromJulianDay(2458850.33);
    expect(d2.getFullYear()).toBe(2020);
    var d3 = tsfeatures.fromJulianDay(2458850.33, o);
    expect(d3.getFullYear()).toBe(2020);
});


test('julian day roundtrip', () => {

    var d = new Date();
    var jd = tsfeatures.julianday(d);
    var d2 = tsfeatures.fromJulianDay(jd);

    // console.log(jd);
    // console.log(d);
    // console.log(d2);

    expect(d2.getFullYear()).toBe(d.getFullYear());
    expect(d2.getMonth()).toBe(d.getMonth());
    expect(d2.getDay()).toBe(d.getDay());
    expect(d2.getHours()).toBe(d.getHours());
    expect(d2.getMinutes()).toBe(d.getMinutes());
    expect(d2.getSeconds()).toBe(d.getSeconds());

    var o = {includeTime: false};

    for( var i = 0; i < 20; i++) {
        d = new Date();
        var d3 = tsfeatures.fromJulianDay(tsfeatures.julianday(d));
        expect(d3.getSeconds()).toBe(d.getSeconds());

        d3 = tsfeatures.fromJulianDay(tsfeatures.julianday(d, o), o);
        expect(d3.getFullYear()).toBe(d.getFullYear());
        expect(d3.getMonth()).toBe(d.getMonth());
        expect(d3.getDay()).toBe(d.getDay());
        expect(d3.getHours()).toBe(0);
        expect(d3.getMinutes()).toBe(0);
        expect(d3.getSeconds()).toBe(0);
    }

});


// test('fft', () => {
//     var res = tsfeatures.frequencies([0,1,0,1]);
//     // console.log(res);
//     expect(res.f.length > 0).toBe(true);
// });

// test('fft2', () => {
//     var res = tsfeatures.frequencies([0,1,3]);
//     expect(res.f.length > 0).toBe(false);
//     var r = [];
//     for(var i = 0; i < 100; i++) {
//         r.push(Math.sin(i * 3));
//     }
//     // res = tsfeatures.frequencies([0,1,3,1,0,1,3]);
//     res = tsfeatures.frequencies(r);
//     // expect(res.f.length > 0).toBe(false);
//     console.log("sin: ", res);
// });