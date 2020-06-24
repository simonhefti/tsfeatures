const dl = require("datalib");
import LM from 'ml-levenberg-marquardt';

/** get version info*/
function version() {
    return "v0.0.5";
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
    // console.log("y  :", y);
    // console.log("tmp:", tmp);
    var res = {};
    res.lowest = [];
    var max = N;
    // console.log("max:", max);
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
    // console.log("min:", min);
    for (var i = tmp.length - 1; i >= min; i--) {
        res.highest.push(y.indexOf(tmp[i]));
    }
    return res;
}



/** get base notions from time series (time t and observation r) */
function characteristics(t, r) {

    if (t === undefined) throw "t must be defined";
    if (t === null) "t must be non-null";
    if (t.length <= 0) "t.length must be > 0";

    if (r === undefined) throw "r must be defined";
    if (r === null) "r must be non-null";
    if (r.length <= 0) "r.length must be > 0";

    if (r.length !== t.length) "r and t must have same length";

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
    ac.push(1.0);
    for (var i = 1; i < r2.length * 0.7; i++) {
        ac.push(autocorrelation(res, i));
    }
    res.ac = ac;
    var hlindex = indexOfNLargestSmallest(ac, 10);
    for (var j = 1; j < 10; j++) {
        var vn = "ac_top_" + j + "_idx";
        res[vn] = hlindex.highest[j - 1];
        var vn = "ac_top_" + j + "_val";
        res[vn] = ac[hlindex.highest[j - 1]];
        var vn = "ac_low_" + j + "_idx";
        res[vn] = hlindex.lowest[j - 1];
        var vn = "ac_low_" + j + "_val";
        res[vn] = ac[hlindex.lowest[j - 1]];
    }

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
    res.r_q_1 = dl.quantile(r2, 0.1);
    res.r_q_2 = dl.quantile(r2, 0.2);
    res.r_q_3 = dl.quantile(r2, 0.3);
    res.r_q_4 = dl.quantile(r2, 0.4);
    res.r_q_5 = dl.quantile(r2, 0.5);
    res.r_q_6 = dl.quantile(r2, 0.6);
    res.r_q_7 = dl.quantile(r2, 0.7);
    res.r_q_8 = dl.quantile(r2, 0.8);
    res.r_q_9 = dl.quantile(r2, 0.9);

    return res;
}

export {
    minmaxsum, moment, autocorrelation, indexOfNLargestSmallest
    , characteristics, version
    , polynomial_1, polynomial_2, polynomial_3, polynomial_4, fit_polynomial
}