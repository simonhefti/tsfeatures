import LM from 'ml-levenberg-marquardt';

/** get version info*/
function version() {
    return "v0.1.5";
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

/** check correct array sizes and convert to number or throw error */
function checkconv(t, r) {

    if (t === undefined) throw "t must be defined";
    if (t === null) throw "t must be non-null";
    if (t.length <= 0) throw "t.length must be > 0";

    if (r === undefined) throw "r must be defined";
    if (r === null) throw "r must be non-null";
    if (r.length <= 0) throw "r.length must be > 0";

    if (r.length !== t.length) throw "r and t must have same length";

    var res = {};

    // convert to number
    res.t = [];
    t.forEach(v => { res.t.push(Number(v)) });
    res.r = [];
    r.forEach(v => { res.r.push(Number(v)) });

    return res;
}


/** get min, max, sum, avg (assumes number) */
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
    res.avg = res.sum / y.length;
    return res;
}

/** calculate moments making use of pre-calculated characteristics */
function moment(c, moment) {
    var res = 0;
    c.t.forEach((v, idx) => {
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

/** calculate derivative (assumes pre-check and conversion to numbers already done) */
function derivative(t, r) {

    var res = [];
    res.push(0);

    for (var i = 1; i < r.length; i++) {
        var dt = t[i] - t[i - 1];
        var dr = r[i] - r[i - 1];
        res.push(dr / dt);
    }

    return res;
}

/** get derivative and indicative roots (Nullstellen) (pre-check and conversion to numbers already done) */
function roots(t, r) {
    // smooth
    var s = smooth(t, r, 1);
    // get first derivative
    var d = derivative(t, s);
    // min, max, ...
    var d_mms = minmaxsum(d);
    // find roots (values)
    var d_limit = d_mms.max * 0.1;
    var peaks = d.filter(v => v > -d_limit && v < d_limit);
    // from root values to root indices
    var locs = [];
    peaks.forEach(v => {
        locs.push(d.indexOf(v));
    });
    // remove duplicates
    locs = locs.filter((v, i, a) => a.indexOf(v) === i);

    // check for multiple consecutive entries
    var groups = [];
    var group = [];
    if (locs.length > 0) {
        group.push(locs[0]);
        for (var i = 1; i < locs.length; i++) {
            if (locs[i] - locs[i - 1] === 1) {
                group.push(locs[i]);
            } else {
                groups.push(group);
                group = [];
                group.push(locs[i]);
            }
        }
    }
    // get value for center of each group
    var peak_vals = [];
    var peak_idxs = [];
    groups.forEach(group => {
        var idx = Math.floor(group.length / 2 + group[0]);
        peak_idxs.push(idx);
        peak_vals.push(r[idx]);
    });

    var res = {};
    res.d = d;
    res.d_mms = d_mms;
    res.d_limit = d_limit;
    res.peak_vals = peak_vals;
    res.peak_idxs = peak_idxs;
    res.groups = groups;
    return res;
}

/** exponential smoothing with sigma as in 1/sigma/sqrt(2 pi) exp(-(x-x0)^2/2/sigma^2) */
function smooth(t, r, sigma) {
    var s = r.map(v => 0);
    for (var i = 0; i < r.length; i++) {
        var t0 = t[i];
        var lb = t0 - 3.0 * sigma;
        var ub = t0 + 3.0 * sigma;
        var f = r.map(v => 0); // filter function
        var sum = 0;
        var sum_f = 0;
        for (var j = 0; j < r.length; j++) {
            if (t[j] >= lb && t[j] <= ub) {
                f[j] = 
                    Math.exp(
                        -Math.pow(t[j] - t0, 2)
                        / 2.0
                        / Math.pow(sigma, 2)
                    )
                    / sigma / Math.sqrt(2.0 * Math.PI);
                sum += f[j] * r[j];
                sum_f += f[j];
            }
        }
        s[i] = sum / sum_f;
    }
    return s; // for chaining
}

/** get base notions from time series (time t and observation r) */
function characteristics(t, r) {

    var res = checkconv(t, r);

    /** basic descriptive statistics */
    var mms = minmaxsum(res.r);
    res.r_mms = mms;

    /** lift into positive range */
    res.r_lift_min = [];
    res.r.forEach(v => { res.r_lift_min.push(v - res.r_mms.min) });

    /** lift by mean */
    res.r_lift_avg = [];
    res.r.forEach(v => { res.r_lift_avg.push(v - res.r_mms.avg) });
    res.sum_r_lifted_sq = 0;
    res.r_lift_avg.forEach(v => { res.sum_r_lifted_sq += v * v });

    /** distribution function */
    var sum_lifted = 0;
    res.r_lift_min.forEach(v => { sum_lifted += v; });
    res.f = [];
    res.r_lift_min.forEach(v => { res.f.push(v / sum_lifted); });

    /** moments 0 .. 5 */
    res.mon_0 = moment(res, 0);
    res.mon_1 = moment(res, 1);
    res.mon_2 = moment(res, 2);
    res.mon_3 = moment(res, 3);
    res.mon_4 = moment(res, 4);
    res.mon_5 = moment(res, 5);

    /** above / below avg count */
    res.r_above_avg_cnt = 0;
    res.r_below_avg_cnt = 0;
    res.r.forEach(v => {
        if (v >= res.r_mms.avg) {
            res.r_above_avg_cnt++;
        } else {
            res.r_below_avg_cnt++;
        }
    });

    /** autocorrelation */
    res.ac = [];
    res.ac_t = [];
    res.ac.push(1.0);
    res.ac_t.push(res.t[0]);
    for (var i = 1; i < res.r.length * 0.9; i++) {
        res.ac.push(autocorrelation(res, i));
        res.ac_t.push(res.t[i]);
    }

    /** derivative of autocorrelation */
    res.ac_roots = roots(res.ac_t, res.ac);

    /** derivative of time series */
    res.roots = roots(res.t, res.r);

    /** add polynomials */
    res.lm1 = fit_polynomial(res.t, res.r, polynomial_1, {
        damping: 1.5,
        initialValues: [1, 1]
    });
    res.lm2 = fit_polynomial(res.t, res.r, polynomial_2, {
        damping: 1.5,
        initialValues: [res.lm1.parameterValues[0], res.lm1.parameterValues[1], 1]
    });
    res.lm3 = fit_polynomial(res.t, res.r, polynomial_3, {
        damping: 1.5,
        initialValues: [1, 1, 1, 1]
    });

    /** add quantiles */
    res.r_q_1 = quantile(res.r, 0.25);
    res.r_q_2 = quantile(res.r, 0.50);
    res.r_q_3 = quantile(res.r, 0.75);

    /** binning */
    var lims = [0, 0.2, 0.4, 0.6, 0.8, 1.0];
    for( var i = 0; i < lims.length - 1; i++) {
        var lb = res.r_mms.min + (res.r_mms.max - res.r_mms.min) * lims[i];
        var hb = res.r_mms.min + (res.r_mms.max - res.r_mms.min) * lims[i+1];
        var featurename = "r_bin_" + (i+1);
        if( i < lims.length -2) {
            res[featurename] = res.r.filter(v => v >= lb && v < hb).length;
        } else {
            res[featurename] = res.r.filter(v => v >= lb && v <= hb).length;
        }
        // console.log(featurename);
        // console.log(res);
    }


    // // console.log("r2", r2);
    // // console.log("min", res.r_min, "max", res.r_max);
    // var lb = res.r_mms.min;
    // var hb = res.r_mms.min + (res.r_mms.max - res.r_mms.min) * 0.25;
    // res.r_bin_1 = res.r.filter(v => v >= lb && v < hb).length; //count of values in first 25%
    // // console.log("lb", lb, "hb", hb, "v", r2.filter(v => v >= lb && v < hb), "res", res.r_bin_1);
    // lb = res.r_mms.min + (res.r_mms.max - res.r_mms.min) * 0.25;
    // hb = res.r_mms.min + (res.r_mms.max - res.r_mms.min) * 0.50;
    // res.r_bin_2 = res.r.filter(v => v >= lb && v < hb).length;
    // // console.log("lb", lb, "hb", hb, "v", r2.filter(v => v >= lb && v < hb), "res", res.r_bin_2);
    // lb = res.r_mms.min + (res.r_mms.max - res.r_mms.min) * 0.50;
    // hb = res.r_mms.min + (res.r_mms.max - res.r_mms.min) * 0.75;
    // res.r_bin_3 = res.r.filter(v => v >= lb && v < hb).length;
    // // console.log("lb", lb, "hb", hb, "v", r2.filter(v => v >= lb && v < hb), "res", res.r_bin_3);
    // lb = res.r_mms.min + (res.r_mms.max - res.r_mms.min) * 0.75;
    // hb = res.r_mms.min + (res.r_mms.max - res.r_mms.min) * 1.0;
    // res.r_bin_4 = res.r.filter(v => v >= lb && v <= hb).length;
    // // console.log("lb", lb, "hb", hb, "v", r2.filter(v => v >= lb && v <= hb), "res", res.r_bin_4);

    return res;
}

export {
    version
    , minmaxsum
    , moment
    , autocorrelation
    , characteristics
    , polynomial_1, polynomial_2, polynomial_3, polynomial_4, polynomial_5
    , fit_polynomial
    , derivative
    , roots
    , quantile
    , checkconv
    , smooth
}