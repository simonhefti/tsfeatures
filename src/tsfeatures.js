import LM from 'ml-levenberg-marquardt';

/** get version info*/
function version() {
    return "v0.1.0";
}


function polynomial_1([p0, p1]) {
    return t => p0 + p1 * t;
}
function polynomial_2([p0, p1, p2]) {
    return t => p0 + p1 * t + p2 * Math.pow(t, 2);
}
function polynomial_3([p0, p1, p2, p3]) {
    return t => p0 + p1 * t + p2 * Math.pow(t, 2) + p3 * Math.pow(t, 3);
}
function polynomial_4([p0, p1, p2, p3, p4]) {
    return t => p0 + p1 * t + p2 * Math.pow(t, 2) + p3 * Math.pow(t, 3) + p4 * Math.pow(t, 4);
}
function polynomial_5([p0, p1, p2, p3, p4, p5]) {
    return t => p0 + p1 * t + p2 * Math.pow(t, 2) + p3 * Math.pow(t, 3) + p4 * Math.pow(t, 4) + p5 * Math.pow(t, 5);
}

function fit_polynomial(x, y, polynomial, options) {
    var res = LM({ x: x, y: y }, polynomial, options);
    return res;
}

/** get min, max, sum */
function minmaxsum(y) {
    var res = {};
    res.max = Number.MIN_VALUE;
    res.min = Number.MAX_VALUE;
    res.sum = 0;
    y.forEach(v => {
        if (v > res.max) {
            res.max = v;
        }
        if (v < res.min) {
            res.min = v;
        }
        res.sum += v;
        // console.log("res.sum: ", res.sum);
    });
    res.mean = res.sum / y.length;
    return res;
}

/** calculate moments making use of pre-calculated characteristics */
function moment(t, c, moment) {
    var res = 0;
    t.forEach((v, idx) => {
        res += c.f[idx] * Math.pow(v, moment);
    });
    return res;
}

/** calculate quantile q of given array y */
function quantile(y, q) {

    var res = -1;

    var sorted = y.concat().sort((a, b) => a - b);
    var pos = (sorted.length - 1) * q;
    var base = Math.floor(pos);
    var rest = pos - base;
    if (sorted[base + 1] !== undefined) {
        res = sorted[base] + rest * (sorted[base + 1] - sorted[base]);
    } else {
        res = sorted[base];
    }
    return res;
};

/** calculate autocorrelation for lag */
function autocorrelation(c, lag) {
    var res = 0;
    for (var i = 0; i < c.r.length - lag; i++) {
        res += (c.r_lift_avg[i]) * (c.r_lift_avg[i + lag]);
    }
    res /= c.sum_r_lifted_sq;
    return res;
}

/** indices of n largest / smallest values in array */
function indexOfNLargestSmallest(y, N) {

    if (N === undefined) N = 1;
    var tmp = y.concat().sort((a, b) => a - b);
    var res = {};
    res.lowest = [];
    var max = N;
    if (max > y.length) {
        max = y.length;
    }
    for (var i = 0; i < max; i++) {
        res.lowest.push(y.indexOf(tmp[i]));
    }
    res.highest = [];
    var min = y.length - N;
    if (min < 0) {
        min = 0;
    }
    for (var i = tmp.length - 1; i >= min; i--) {
        res.highest.push(y.indexOf(tmp[i]));
    }
    return res;
}

/** calculate derivative */
function derivative(t, r) {

    if (t === undefined) throw "t must be defined";
    if (t === null) throw "t must be non-null";
    if (t.length <= 0) throw "t.length must be > 0";

    if (r === undefined) throw "r must be defined";
    if (r === null) throw "r must be non-null";
    if (r.length <= 0) throw "r.length must be > 0";

    if (r.length !== t.length) throw "r and t must have same length";


    // convert to number
    var t2 = [];
    t.forEach(v => { t2.push(Number(v)) });
    var r2 = [];
    r.forEach(v => { r2.push(Number(v)) });

    return _derivative(t2, r2);
}

/** calculate derivative (pre-check and number conversions already done) */
function _derivative(t, r) {

    var res = [];
    res.push(0);

    for (var i = 1; i < r.length; i++) {
        var dt = t[i] - t[i - 1];
        var dr = r[i] - r[i - 1];
        res.push(dr / dt);
    }

    return res;
}

/** get derivative and indicative roots (Nullstellen) */
function roots(t,r) {

    if (t === undefined) throw "t must be defined";
    if (t === null) throw "t must be non-null";
    if (t.length <= 0) throw "t.length must be > 0";

    if (r === undefined) throw "r must be defined";
    if (r === null) throw "r must be non-null";
    if (r.length <= 0) throw "r.length must be > 0";

    if (r.length !== t.length) throw "r and t must have same length";

    // convert to number
    var t2 = [];
    t.forEach(v => { t2.push(Number(v)) });
    var r2 = [];
    r.forEach(v => { r2.push(Number(v)) });


    var d = derivative(t, r);
    res.ac_d_mms = minmaxsum(res.ac_d);
    var ac_d_limit = res.ac_d_mms.max * 0.1;
    var peaks = res.ac_d.filter(v => v > -ac_d_limit && v < ac_d_limit);
    res.ac_p1_val = 0;
    res.ac_p1_idx = 0;
    res.ac_p2_val = 0;
    res.ac_p2_idx = 0;
    res.ac_p3_val = 0;
    res.ac_p3_idx = 0;
    res.ac_p4_val = 0;
    res.ac_p4_idx = 0;
    res.ac_p5_val = 0;
    res.ac_p5_idx = 0;
    if( peaks.length > 0) {
        res.ac_p1_val = peaks[0];
        res.ac_p1_idx = res.ad_d.indexOf(peaks[0]) + 1;
    }
    if( peaks.length > 1) {
        res.ac_p2_val = peaks[1];
        res.ac_p2_idx = res.ad_d.indexOf(peaks[1]) + 1;
    }
    if( peaks.length > 2) {
        res.ac_p3_val = peaks[2];
        res.ac_p3_idx = res.ad_d.indexOf(peaks[2]) + 1;
    }
    if( peaks.length > 3) {
        res.ac_p4_val = peaks[3];
        res.ac_p4_idx = res.ad_d.indexOf(peaks[3]) + 1;
    }
    if( peaks.length > 4) {
        res.ac_p5_val = peaks[4];
        res.ac_p5_idx = res.ad_d.indexOf(peaks[4]) + 1;
    }
    
}

/** get base notions from time series (time t and observation r) */
function characteristics(t, r) {

    if (t === undefined) throw "t must be defined";
    if (t === null) throw "t must be non-null";
    if (t.length <= 0) throw "t.length must be > 0";

    if (r === undefined) throw "r must be defined";
    if (r === null) throw "r must be non-null";
    if (r.length <= 0) throw "r.length must be > 0";

    if (r.length !== t.length) throw "r and t must have same length";

    // convert to number
    var t2 = [];
    t.forEach(v => { t2.push(Number(v)) });
    var r2 = [];
    r.forEach(v => { r2.push(Number(v)) });

    var res = {};

    /** document input */
    res.t = t2;
    res.r = r2;

    /** basic descriptive statistics */
    var mms = minmaxsum(r2);
    res.r_min = mms.min;
    res.r_max = mms.max;
    res.r_sum = mms.sum;
    res.r_avg = mms.mean;

    /** lift into positive range */
    res.r_lift_min = [];
    r2.forEach(v => { res.r_lift_min.push(v - res.r_min) });

    /** lift by mean */
    res.r_lift_avg = [];
    r2.forEach(v => { res.r_lift_avg.push(v - res.r_avg) });
    res.sum_r_lifted_sq = 0;
    res.r_lift_avg.forEach(v => { res.sum_r_lifted_sq += v * v });

    /** distribution function */
    var sum_lifted = 0;
    res.r_lift_min.forEach(v => { sum_lifted += v; });
    res.f = [];
    res.r_lift_min.forEach(v => { res.f.push(v / sum_lifted); });

    /** moments 0 .. 5 */
    res.mon_0 = moment(t2, res, 0);
    res.mon_1 = moment(t2, res, 1);
    res.mon_2 = moment(t2, res, 2);
    res.mon_3 = moment(t2, res, 3);
    res.mon_4 = moment(t2, res, 4);
    res.mon_5 = moment(t2, res, 5);

    /** above / below avg count */
    res.r_above_avg_cnt = 0;
    res.r_below_avg_cnt = 0;
    res.r.forEach(v => {
        if (v >= res.r_avg) {
            res.r_above_avg_cnt++;
        } else {
            res.r_below_avg_cnt++;
        }
    });

    /** most important autocorrelation peaks */
    var ac = [];
    var ac_t = [];
    ac.push(1.0);
    ac_t.push(t2[0]);
    for (var i = 1; i < r2.length * 0.9; i++) {
        ac.push(autocorrelation(res, i));
    }
    res.ac = ac;
    res.ac_mms = minmaxsum(res.ac);
    // derivative of autocorrelation
    res.ac_d = derivative(ac_t, ac);
    res.ac_d_mms = minmaxsum(res.ac_d);
    var ac_d_limit = res.ac_d_mms.max * 0.1;
    var peaks = res.ac_d.filter(v => v > -ac_d_limit && v < ac_d_limit);
    res.ac_p1_val = 0;
    res.ac_p1_idx = 0;
    res.ac_p2_val = 0;
    res.ac_p2_idx = 0;
    res.ac_p3_val = 0;
    res.ac_p3_idx = 0;
    res.ac_p4_val = 0;
    res.ac_p4_idx = 0;
    res.ac_p5_val = 0;
    res.ac_p5_idx = 0;
    if( peaks.length > 0) {
        res.ac_p1_val = peaks[0];
        res.ac_p1_idx = res.ad_d.indexOf(peaks[0]) + 1;
    }
    if( peaks.length > 1) {
        res.ac_p2_val = peaks[1];
        res.ac_p2_idx = res.ad_d.indexOf(peaks[1]) + 1;
    }
    if( peaks.length > 2) {
        res.ac_p3_val = peaks[2];
        res.ac_p3_idx = res.ad_d.indexOf(peaks[2]) + 1;
    }
    if( peaks.length > 3) {
        res.ac_p4_val = peaks[3];
        res.ac_p4_idx = res.ad_d.indexOf(peaks[3]) + 1;
    }
    if( peaks.length > 4) {
        res.ac_p5_val = peaks[4];
        res.ac_p5_idx = res.ad_d.indexOf(peaks[4]) + 1;
    }

    // var hlindex = indexOfNLargestSmallest(ac, 10);
    // for (var j = 1; j < 10; j++) {
    //     var vn = "ac_top_" + j + "_idx";
    //     res[vn] = hlindex.highest[j - 1];
    //     var vn = "ac_top_" + j + "_val";
    //     res[vn] = ac[hlindex.highest[j - 1]];
    //     var vn = "ac_low_" + j + "_idx";
    //     res[vn] = hlindex.lowest[j - 1];
    //     var vn = "ac_low_" + j + "_val";
    //     res[vn] = ac[hlindex.lowest[j - 1]];
    // }

    /** add polynomials */
    res.lm1 = fit_polynomial(t2, r2, polynomial_1, {
        damping: 1.5,
        initialValues: [1, 1]
    });
    res.lm2 = fit_polynomial(t2, r2, polynomial_2, {
        damping: 1.5,
        initialValues: [res.lm1.parameterValues[0], res.lm1.parameterValues[1], 1]
    });
    res.lm3 = fit_polynomial(t2, r2, polynomial_3, {
        damping: 1.5,
        initialValues: [1, 1, 1, 1]
    });

    /** add quantiles */
    res.r_q_1 = quantile(r2, 0.25);
    res.r_q_2 = quantile(r2, 0.50);
    res.r_q_3 = quantile(r2, 0.75);

    /** binning */
    // console.log("r2", r2);
    // console.log("min", res.r_min, "max", res.r_max);
    var lb = res.r_min;
    var hb = res.r_min + (res.r_max - res.r_min) * 0.25;
    res.r_bin_1 = r2.filter(v => v >= lb && v < hb).length; //count of values in first 25%
    // console.log("lb", lb, "hb", hb, "v", r2.filter(v => v >= lb && v < hb), "res", res.r_bin_1);
    lb = res.r_min + (res.r_max - res.r_min) * 0.25;
    hb = res.r_min + (res.r_max - res.r_min) * 0.50;
    res.r_bin_2 = r2.filter(v => v >= lb && v < hb).length;
    // console.log("lb", lb, "hb", hb, "v", r2.filter(v => v >= lb && v < hb), "res", res.r_bin_2);
    lb = res.r_min + (res.r_max - res.r_min) * 0.50;
    hb = res.r_min + (res.r_max - res.r_min) * 0.75;
    res.r_bin_3 = r2.filter(v => v >= lb && v < hb).length;
    // console.log("lb", lb, "hb", hb, "v", r2.filter(v => v >= lb && v < hb), "res", res.r_bin_3);
    lb = res.r_min + (res.r_max - res.r_min) * 0.75;
    hb = res.r_min + (res.r_max - res.r_min) * 1.0;
    res.r_bin_4 = r2.filter(v => v >= lb && v <= hb).length;
    // console.log("lb", lb, "hb", hb, "v", r2.filter(v => v >= lb && v <= hb), "res", res.r_bin_4);

    return res;
}

export {
    minmaxsum, moment, autocorrelation, indexOfNLargestSmallest
    , characteristics, version
    , polynomial_1, polynomial_2, polynomial_3, polynomial_4, fit_polynomial
    , polynomial_5, derivative
    , quantile
    // , frequencies
}