(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
  typeof define === 'function' && define.amd ? define(['exports'], factory) :
  (global = global || self, factory(global.tsfeatures = {}));
}(this, (function (exports) { 'use strict';

  const toString = Object.prototype.toString;

  function isAnyArray(object) {
    return toString.call(object).endsWith('Array]');
  }

  /**
   * Calculate current error
   * @ignore
   * @param {{x:Array<number>, y:Array<number>}} data - Array of points to fit in the format [x1, x2, ... ], [y1, y2, ... ]
   * @param {Array<number>} parameters - Array of current parameter values
   * @param {function} parameterizedFunction - The parameters and returns a function with the independent variable as a parameter
   * @return {number}
   */
  function errorCalculation(
    data,
    parameters,
    parameterizedFunction,
  ) {
    let error = 0;
    const func = parameterizedFunction(parameters);

    for (let i = 0; i < data.x.length; i++) {
      error += Math.abs(data.y[i] - func(data.x[i]));
    }

    return error;
  }

  const toString$1 = Object.prototype.toString;

  function isAnyArray$1(object) {
    return toString$1.call(object).endsWith('Array]');
  }

  var src = isAnyArray$1;

  const toString$2 = Object.prototype.toString;

  function isAnyArray$2(object) {
    return toString$2.call(object).endsWith('Array]');
  }

  var src$1 = isAnyArray$2;

  /**
   * Computes the maximum of the given values
   * @param {Array<number>} input
   * @return {number}
   */

  function max(input) {
    if (!src$1(input)) {
      throw new TypeError('input must be an array');
    }

    if (input.length === 0) {
      throw new TypeError('input must not be empty');
    }

    var maxValue = input[0];

    for (var i = 1; i < input.length; i++) {
      if (input[i] > maxValue) maxValue = input[i];
    }

    return maxValue;
  }

  const toString$3 = Object.prototype.toString;

  function isAnyArray$3(object) {
    return toString$3.call(object).endsWith('Array]');
  }

  var src$2 = isAnyArray$3;

  /**
   * Computes the minimum of the given values
   * @param {Array<number>} input
   * @return {number}
   */

  function min(input) {
    if (!src$2(input)) {
      throw new TypeError('input must be an array');
    }

    if (input.length === 0) {
      throw new TypeError('input must not be empty');
    }

    var minValue = input[0];

    for (var i = 1; i < input.length; i++) {
      if (input[i] < minValue) minValue = input[i];
    }

    return minValue;
  }

  /**
   *
   * @param {Array} input
   * @param {object} [options={}]
   * @param {Array} [options.output=[]] specify the output array, can be the input array for in place modification
   */

  function rescale(input) {
    var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

    if (!src(input)) {
      throw new TypeError('input must be an array');
    } else if (input.length === 0) {
      throw new TypeError('input must not be empty');
    }

    var output;

    if (options.output !== undefined) {
      if (!src(options.output)) {
        throw new TypeError('output option must be an array if specified');
      }

      output = options.output;
    } else {
      output = new Array(input.length);
    }

    var currentMin = min(input);
    var currentMax = max(input);

    if (currentMin === currentMax) {
      throw new RangeError('minimum and maximum input values are equal. Cannot rescale a constant array');
    }

    var _options$min = options.min,
        minValue = _options$min === void 0 ? options.autoMinMax ? currentMin : 0 : _options$min,
        _options$max = options.max,
        maxValue = _options$max === void 0 ? options.autoMinMax ? currentMax : 1 : _options$max;

    if (minValue >= maxValue) {
      throw new RangeError('min option must be smaller than max option');
    }

    var factor = (maxValue - minValue) / (currentMax - currentMin);

    for (var i = 0; i < input.length; i++) {
      output[i] = (input[i] - currentMin) * factor + minValue;
    }

    return output;
  }

  const indent = ' '.repeat(2);
  const indentData = ' '.repeat(4);

  function inspectMatrix() {
    return inspectMatrixWithOptions(this);
  }

  function inspectMatrixWithOptions(matrix, options = {}) {
    const { maxRows = 15, maxColumns = 10, maxNumSize = 8 } = options;
    return `${matrix.constructor.name} {
${indent}[
${indentData}${inspectData(matrix, maxRows, maxColumns, maxNumSize)}
${indent}]
${indent}rows: ${matrix.rows}
${indent}columns: ${matrix.columns}
}`;
  }

  function inspectData(matrix, maxRows, maxColumns, maxNumSize) {
    const { rows, columns } = matrix;
    const maxI = Math.min(rows, maxRows);
    const maxJ = Math.min(columns, maxColumns);
    const result = [];
    for (let i = 0; i < maxI; i++) {
      let line = [];
      for (let j = 0; j < maxJ; j++) {
        line.push(formatNumber(matrix.get(i, j), maxNumSize));
      }
      result.push(`${line.join(' ')}`);
    }
    if (maxJ !== columns) {
      result[result.length - 1] += ` ... ${columns - maxColumns} more columns`;
    }
    if (maxI !== rows) {
      result.push(`... ${rows - maxRows} more rows`);
    }
    return result.join(`\n${indentData}`);
  }

  function formatNumber(num, maxNumSize) {
    const numStr = String(num);
    if (numStr.length <= maxNumSize) {
      return numStr.padEnd(maxNumSize, ' ');
    }
    const precise = num.toPrecision(maxNumSize - 2);
    if (precise.length <= maxNumSize) {
      return precise;
    }
    const exponential = num.toExponential(maxNumSize - 2);
    const eIndex = exponential.indexOf('e');
    const e = exponential.slice(eIndex);
    return exponential.slice(0, maxNumSize - e.length) + e;
  }

  function installMathOperations(AbstractMatrix, Matrix) {
    AbstractMatrix.prototype.add = function add(value) {
      if (typeof value === 'number') return this.addS(value);
      return this.addM(value);
    };

    AbstractMatrix.prototype.addS = function addS(value) {
      for (let i = 0; i < this.rows; i++) {
        for (let j = 0; j < this.columns; j++) {
          this.set(i, j, this.get(i, j) + value);
        }
      }
      return this;
    };

    AbstractMatrix.prototype.addM = function addM(matrix) {
      matrix = Matrix.checkMatrix(matrix);
      if (this.rows !== matrix.rows ||
        this.columns !== matrix.columns) {
        throw new RangeError('Matrices dimensions must be equal');
      }
      for (let i = 0; i < this.rows; i++) {
        for (let j = 0; j < this.columns; j++) {
          this.set(i, j, this.get(i, j) + matrix.get(i, j));
        }
      }
      return this;
    };

    AbstractMatrix.add = function add(matrix, value) {
      const newMatrix = new Matrix(matrix);
      return newMatrix.add(value);
    };

    AbstractMatrix.prototype.sub = function sub(value) {
      if (typeof value === 'number') return this.subS(value);
      return this.subM(value);
    };

    AbstractMatrix.prototype.subS = function subS(value) {
      for (let i = 0; i < this.rows; i++) {
        for (let j = 0; j < this.columns; j++) {
          this.set(i, j, this.get(i, j) - value);
        }
      }
      return this;
    };

    AbstractMatrix.prototype.subM = function subM(matrix) {
      matrix = Matrix.checkMatrix(matrix);
      if (this.rows !== matrix.rows ||
        this.columns !== matrix.columns) {
        throw new RangeError('Matrices dimensions must be equal');
      }
      for (let i = 0; i < this.rows; i++) {
        for (let j = 0; j < this.columns; j++) {
          this.set(i, j, this.get(i, j) - matrix.get(i, j));
        }
      }
      return this;
    };

    AbstractMatrix.sub = function sub(matrix, value) {
      const newMatrix = new Matrix(matrix);
      return newMatrix.sub(value);
    };
    AbstractMatrix.prototype.subtract = AbstractMatrix.prototype.sub;
    AbstractMatrix.prototype.subtractS = AbstractMatrix.prototype.subS;
    AbstractMatrix.prototype.subtractM = AbstractMatrix.prototype.subM;
    AbstractMatrix.subtract = AbstractMatrix.sub;

    AbstractMatrix.prototype.mul = function mul(value) {
      if (typeof value === 'number') return this.mulS(value);
      return this.mulM(value);
    };

    AbstractMatrix.prototype.mulS = function mulS(value) {
      for (let i = 0; i < this.rows; i++) {
        for (let j = 0; j < this.columns; j++) {
          this.set(i, j, this.get(i, j) * value);
        }
      }
      return this;
    };

    AbstractMatrix.prototype.mulM = function mulM(matrix) {
      matrix = Matrix.checkMatrix(matrix);
      if (this.rows !== matrix.rows ||
        this.columns !== matrix.columns) {
        throw new RangeError('Matrices dimensions must be equal');
      }
      for (let i = 0; i < this.rows; i++) {
        for (let j = 0; j < this.columns; j++) {
          this.set(i, j, this.get(i, j) * matrix.get(i, j));
        }
      }
      return this;
    };

    AbstractMatrix.mul = function mul(matrix, value) {
      const newMatrix = new Matrix(matrix);
      return newMatrix.mul(value);
    };
    AbstractMatrix.prototype.multiply = AbstractMatrix.prototype.mul;
    AbstractMatrix.prototype.multiplyS = AbstractMatrix.prototype.mulS;
    AbstractMatrix.prototype.multiplyM = AbstractMatrix.prototype.mulM;
    AbstractMatrix.multiply = AbstractMatrix.mul;

    AbstractMatrix.prototype.div = function div(value) {
      if (typeof value === 'number') return this.divS(value);
      return this.divM(value);
    };

    AbstractMatrix.prototype.divS = function divS(value) {
      for (let i = 0; i < this.rows; i++) {
        for (let j = 0; j < this.columns; j++) {
          this.set(i, j, this.get(i, j) / value);
        }
      }
      return this;
    };

    AbstractMatrix.prototype.divM = function divM(matrix) {
      matrix = Matrix.checkMatrix(matrix);
      if (this.rows !== matrix.rows ||
        this.columns !== matrix.columns) {
        throw new RangeError('Matrices dimensions must be equal');
      }
      for (let i = 0; i < this.rows; i++) {
        for (let j = 0; j < this.columns; j++) {
          this.set(i, j, this.get(i, j) / matrix.get(i, j));
        }
      }
      return this;
    };

    AbstractMatrix.div = function div(matrix, value) {
      const newMatrix = new Matrix(matrix);
      return newMatrix.div(value);
    };
    AbstractMatrix.prototype.divide = AbstractMatrix.prototype.div;
    AbstractMatrix.prototype.divideS = AbstractMatrix.prototype.divS;
    AbstractMatrix.prototype.divideM = AbstractMatrix.prototype.divM;
    AbstractMatrix.divide = AbstractMatrix.div;

    AbstractMatrix.prototype.mod = function mod(value) {
      if (typeof value === 'number') return this.modS(value);
      return this.modM(value);
    };

    AbstractMatrix.prototype.modS = function modS(value) {
      for (let i = 0; i < this.rows; i++) {
        for (let j = 0; j < this.columns; j++) {
          this.set(i, j, this.get(i, j) % value);
        }
      }
      return this;
    };

    AbstractMatrix.prototype.modM = function modM(matrix) {
      matrix = Matrix.checkMatrix(matrix);
      if (this.rows !== matrix.rows ||
        this.columns !== matrix.columns) {
        throw new RangeError('Matrices dimensions must be equal');
      }
      for (let i = 0; i < this.rows; i++) {
        for (let j = 0; j < this.columns; j++) {
          this.set(i, j, this.get(i, j) % matrix.get(i, j));
        }
      }
      return this;
    };

    AbstractMatrix.mod = function mod(matrix, value) {
      const newMatrix = new Matrix(matrix);
      return newMatrix.mod(value);
    };
    AbstractMatrix.prototype.modulus = AbstractMatrix.prototype.mod;
    AbstractMatrix.prototype.modulusS = AbstractMatrix.prototype.modS;
    AbstractMatrix.prototype.modulusM = AbstractMatrix.prototype.modM;
    AbstractMatrix.modulus = AbstractMatrix.mod;

    AbstractMatrix.prototype.and = function and(value) {
      if (typeof value === 'number') return this.andS(value);
      return this.andM(value);
    };

    AbstractMatrix.prototype.andS = function andS(value) {
      for (let i = 0; i < this.rows; i++) {
        for (let j = 0; j < this.columns; j++) {
          this.set(i, j, this.get(i, j) & value);
        }
      }
      return this;
    };

    AbstractMatrix.prototype.andM = function andM(matrix) {
      matrix = Matrix.checkMatrix(matrix);
      if (this.rows !== matrix.rows ||
        this.columns !== matrix.columns) {
        throw new RangeError('Matrices dimensions must be equal');
      }
      for (let i = 0; i < this.rows; i++) {
        for (let j = 0; j < this.columns; j++) {
          this.set(i, j, this.get(i, j) & matrix.get(i, j));
        }
      }
      return this;
    };

    AbstractMatrix.and = function and(matrix, value) {
      const newMatrix = new Matrix(matrix);
      return newMatrix.and(value);
    };

    AbstractMatrix.prototype.or = function or(value) {
      if (typeof value === 'number') return this.orS(value);
      return this.orM(value);
    };

    AbstractMatrix.prototype.orS = function orS(value) {
      for (let i = 0; i < this.rows; i++) {
        for (let j = 0; j < this.columns; j++) {
          this.set(i, j, this.get(i, j) | value);
        }
      }
      return this;
    };

    AbstractMatrix.prototype.orM = function orM(matrix) {
      matrix = Matrix.checkMatrix(matrix);
      if (this.rows !== matrix.rows ||
        this.columns !== matrix.columns) {
        throw new RangeError('Matrices dimensions must be equal');
      }
      for (let i = 0; i < this.rows; i++) {
        for (let j = 0; j < this.columns; j++) {
          this.set(i, j, this.get(i, j) | matrix.get(i, j));
        }
      }
      return this;
    };

    AbstractMatrix.or = function or(matrix, value) {
      const newMatrix = new Matrix(matrix);
      return newMatrix.or(value);
    };

    AbstractMatrix.prototype.xor = function xor(value) {
      if (typeof value === 'number') return this.xorS(value);
      return this.xorM(value);
    };

    AbstractMatrix.prototype.xorS = function xorS(value) {
      for (let i = 0; i < this.rows; i++) {
        for (let j = 0; j < this.columns; j++) {
          this.set(i, j, this.get(i, j) ^ value);
        }
      }
      return this;
    };

    AbstractMatrix.prototype.xorM = function xorM(matrix) {
      matrix = Matrix.checkMatrix(matrix);
      if (this.rows !== matrix.rows ||
        this.columns !== matrix.columns) {
        throw new RangeError('Matrices dimensions must be equal');
      }
      for (let i = 0; i < this.rows; i++) {
        for (let j = 0; j < this.columns; j++) {
          this.set(i, j, this.get(i, j) ^ matrix.get(i, j));
        }
      }
      return this;
    };

    AbstractMatrix.xor = function xor(matrix, value) {
      const newMatrix = new Matrix(matrix);
      return newMatrix.xor(value);
    };

    AbstractMatrix.prototype.leftShift = function leftShift(value) {
      if (typeof value === 'number') return this.leftShiftS(value);
      return this.leftShiftM(value);
    };

    AbstractMatrix.prototype.leftShiftS = function leftShiftS(value) {
      for (let i = 0; i < this.rows; i++) {
        for (let j = 0; j < this.columns; j++) {
          this.set(i, j, this.get(i, j) << value);
        }
      }
      return this;
    };

    AbstractMatrix.prototype.leftShiftM = function leftShiftM(matrix) {
      matrix = Matrix.checkMatrix(matrix);
      if (this.rows !== matrix.rows ||
        this.columns !== matrix.columns) {
        throw new RangeError('Matrices dimensions must be equal');
      }
      for (let i = 0; i < this.rows; i++) {
        for (let j = 0; j < this.columns; j++) {
          this.set(i, j, this.get(i, j) << matrix.get(i, j));
        }
      }
      return this;
    };

    AbstractMatrix.leftShift = function leftShift(matrix, value) {
      const newMatrix = new Matrix(matrix);
      return newMatrix.leftShift(value);
    };

    AbstractMatrix.prototype.signPropagatingRightShift = function signPropagatingRightShift(value) {
      if (typeof value === 'number') return this.signPropagatingRightShiftS(value);
      return this.signPropagatingRightShiftM(value);
    };

    AbstractMatrix.prototype.signPropagatingRightShiftS = function signPropagatingRightShiftS(value) {
      for (let i = 0; i < this.rows; i++) {
        for (let j = 0; j < this.columns; j++) {
          this.set(i, j, this.get(i, j) >> value);
        }
      }
      return this;
    };

    AbstractMatrix.prototype.signPropagatingRightShiftM = function signPropagatingRightShiftM(matrix) {
      matrix = Matrix.checkMatrix(matrix);
      if (this.rows !== matrix.rows ||
        this.columns !== matrix.columns) {
        throw new RangeError('Matrices dimensions must be equal');
      }
      for (let i = 0; i < this.rows; i++) {
        for (let j = 0; j < this.columns; j++) {
          this.set(i, j, this.get(i, j) >> matrix.get(i, j));
        }
      }
      return this;
    };

    AbstractMatrix.signPropagatingRightShift = function signPropagatingRightShift(matrix, value) {
      const newMatrix = new Matrix(matrix);
      return newMatrix.signPropagatingRightShift(value);
    };

    AbstractMatrix.prototype.rightShift = function rightShift(value) {
      if (typeof value === 'number') return this.rightShiftS(value);
      return this.rightShiftM(value);
    };

    AbstractMatrix.prototype.rightShiftS = function rightShiftS(value) {
      for (let i = 0; i < this.rows; i++) {
        for (let j = 0; j < this.columns; j++) {
          this.set(i, j, this.get(i, j) >>> value);
        }
      }
      return this;
    };

    AbstractMatrix.prototype.rightShiftM = function rightShiftM(matrix) {
      matrix = Matrix.checkMatrix(matrix);
      if (this.rows !== matrix.rows ||
        this.columns !== matrix.columns) {
        throw new RangeError('Matrices dimensions must be equal');
      }
      for (let i = 0; i < this.rows; i++) {
        for (let j = 0; j < this.columns; j++) {
          this.set(i, j, this.get(i, j) >>> matrix.get(i, j));
        }
      }
      return this;
    };

    AbstractMatrix.rightShift = function rightShift(matrix, value) {
      const newMatrix = new Matrix(matrix);
      return newMatrix.rightShift(value);
    };
    AbstractMatrix.prototype.zeroFillRightShift = AbstractMatrix.prototype.rightShift;
    AbstractMatrix.prototype.zeroFillRightShiftS = AbstractMatrix.prototype.rightShiftS;
    AbstractMatrix.prototype.zeroFillRightShiftM = AbstractMatrix.prototype.rightShiftM;
    AbstractMatrix.zeroFillRightShift = AbstractMatrix.rightShift;

    AbstractMatrix.prototype.not = function not() {
      for (let i = 0; i < this.rows; i++) {
        for (let j = 0; j < this.columns; j++) {
          this.set(i, j, ~(this.get(i, j)));
        }
      }
      return this;
    };

    AbstractMatrix.not = function not(matrix) {
      const newMatrix = new Matrix(matrix);
      return newMatrix.not();
    };

    AbstractMatrix.prototype.abs = function abs() {
      for (let i = 0; i < this.rows; i++) {
        for (let j = 0; j < this.columns; j++) {
          this.set(i, j, Math.abs(this.get(i, j)));
        }
      }
      return this;
    };

    AbstractMatrix.abs = function abs(matrix) {
      const newMatrix = new Matrix(matrix);
      return newMatrix.abs();
    };

    AbstractMatrix.prototype.acos = function acos() {
      for (let i = 0; i < this.rows; i++) {
        for (let j = 0; j < this.columns; j++) {
          this.set(i, j, Math.acos(this.get(i, j)));
        }
      }
      return this;
    };

    AbstractMatrix.acos = function acos(matrix) {
      const newMatrix = new Matrix(matrix);
      return newMatrix.acos();
    };

    AbstractMatrix.prototype.acosh = function acosh() {
      for (let i = 0; i < this.rows; i++) {
        for (let j = 0; j < this.columns; j++) {
          this.set(i, j, Math.acosh(this.get(i, j)));
        }
      }
      return this;
    };

    AbstractMatrix.acosh = function acosh(matrix) {
      const newMatrix = new Matrix(matrix);
      return newMatrix.acosh();
    };

    AbstractMatrix.prototype.asin = function asin() {
      for (let i = 0; i < this.rows; i++) {
        for (let j = 0; j < this.columns; j++) {
          this.set(i, j, Math.asin(this.get(i, j)));
        }
      }
      return this;
    };

    AbstractMatrix.asin = function asin(matrix) {
      const newMatrix = new Matrix(matrix);
      return newMatrix.asin();
    };

    AbstractMatrix.prototype.asinh = function asinh() {
      for (let i = 0; i < this.rows; i++) {
        for (let j = 0; j < this.columns; j++) {
          this.set(i, j, Math.asinh(this.get(i, j)));
        }
      }
      return this;
    };

    AbstractMatrix.asinh = function asinh(matrix) {
      const newMatrix = new Matrix(matrix);
      return newMatrix.asinh();
    };

    AbstractMatrix.prototype.atan = function atan() {
      for (let i = 0; i < this.rows; i++) {
        for (let j = 0; j < this.columns; j++) {
          this.set(i, j, Math.atan(this.get(i, j)));
        }
      }
      return this;
    };

    AbstractMatrix.atan = function atan(matrix) {
      const newMatrix = new Matrix(matrix);
      return newMatrix.atan();
    };

    AbstractMatrix.prototype.atanh = function atanh() {
      for (let i = 0; i < this.rows; i++) {
        for (let j = 0; j < this.columns; j++) {
          this.set(i, j, Math.atanh(this.get(i, j)));
        }
      }
      return this;
    };

    AbstractMatrix.atanh = function atanh(matrix) {
      const newMatrix = new Matrix(matrix);
      return newMatrix.atanh();
    };

    AbstractMatrix.prototype.cbrt = function cbrt() {
      for (let i = 0; i < this.rows; i++) {
        for (let j = 0; j < this.columns; j++) {
          this.set(i, j, Math.cbrt(this.get(i, j)));
        }
      }
      return this;
    };

    AbstractMatrix.cbrt = function cbrt(matrix) {
      const newMatrix = new Matrix(matrix);
      return newMatrix.cbrt();
    };

    AbstractMatrix.prototype.ceil = function ceil() {
      for (let i = 0; i < this.rows; i++) {
        for (let j = 0; j < this.columns; j++) {
          this.set(i, j, Math.ceil(this.get(i, j)));
        }
      }
      return this;
    };

    AbstractMatrix.ceil = function ceil(matrix) {
      const newMatrix = new Matrix(matrix);
      return newMatrix.ceil();
    };

    AbstractMatrix.prototype.clz32 = function clz32() {
      for (let i = 0; i < this.rows; i++) {
        for (let j = 0; j < this.columns; j++) {
          this.set(i, j, Math.clz32(this.get(i, j)));
        }
      }
      return this;
    };

    AbstractMatrix.clz32 = function clz32(matrix) {
      const newMatrix = new Matrix(matrix);
      return newMatrix.clz32();
    };

    AbstractMatrix.prototype.cos = function cos() {
      for (let i = 0; i < this.rows; i++) {
        for (let j = 0; j < this.columns; j++) {
          this.set(i, j, Math.cos(this.get(i, j)));
        }
      }
      return this;
    };

    AbstractMatrix.cos = function cos(matrix) {
      const newMatrix = new Matrix(matrix);
      return newMatrix.cos();
    };

    AbstractMatrix.prototype.cosh = function cosh() {
      for (let i = 0; i < this.rows; i++) {
        for (let j = 0; j < this.columns; j++) {
          this.set(i, j, Math.cosh(this.get(i, j)));
        }
      }
      return this;
    };

    AbstractMatrix.cosh = function cosh(matrix) {
      const newMatrix = new Matrix(matrix);
      return newMatrix.cosh();
    };

    AbstractMatrix.prototype.exp = function exp() {
      for (let i = 0; i < this.rows; i++) {
        for (let j = 0; j < this.columns; j++) {
          this.set(i, j, Math.exp(this.get(i, j)));
        }
      }
      return this;
    };

    AbstractMatrix.exp = function exp(matrix) {
      const newMatrix = new Matrix(matrix);
      return newMatrix.exp();
    };

    AbstractMatrix.prototype.expm1 = function expm1() {
      for (let i = 0; i < this.rows; i++) {
        for (let j = 0; j < this.columns; j++) {
          this.set(i, j, Math.expm1(this.get(i, j)));
        }
      }
      return this;
    };

    AbstractMatrix.expm1 = function expm1(matrix) {
      const newMatrix = new Matrix(matrix);
      return newMatrix.expm1();
    };

    AbstractMatrix.prototype.floor = function floor() {
      for (let i = 0; i < this.rows; i++) {
        for (let j = 0; j < this.columns; j++) {
          this.set(i, j, Math.floor(this.get(i, j)));
        }
      }
      return this;
    };

    AbstractMatrix.floor = function floor(matrix) {
      const newMatrix = new Matrix(matrix);
      return newMatrix.floor();
    };

    AbstractMatrix.prototype.fround = function fround() {
      for (let i = 0; i < this.rows; i++) {
        for (let j = 0; j < this.columns; j++) {
          this.set(i, j, Math.fround(this.get(i, j)));
        }
      }
      return this;
    };

    AbstractMatrix.fround = function fround(matrix) {
      const newMatrix = new Matrix(matrix);
      return newMatrix.fround();
    };

    AbstractMatrix.prototype.log = function log() {
      for (let i = 0; i < this.rows; i++) {
        for (let j = 0; j < this.columns; j++) {
          this.set(i, j, Math.log(this.get(i, j)));
        }
      }
      return this;
    };

    AbstractMatrix.log = function log(matrix) {
      const newMatrix = new Matrix(matrix);
      return newMatrix.log();
    };

    AbstractMatrix.prototype.log1p = function log1p() {
      for (let i = 0; i < this.rows; i++) {
        for (let j = 0; j < this.columns; j++) {
          this.set(i, j, Math.log1p(this.get(i, j)));
        }
      }
      return this;
    };

    AbstractMatrix.log1p = function log1p(matrix) {
      const newMatrix = new Matrix(matrix);
      return newMatrix.log1p();
    };

    AbstractMatrix.prototype.log10 = function log10() {
      for (let i = 0; i < this.rows; i++) {
        for (let j = 0; j < this.columns; j++) {
          this.set(i, j, Math.log10(this.get(i, j)));
        }
      }
      return this;
    };

    AbstractMatrix.log10 = function log10(matrix) {
      const newMatrix = new Matrix(matrix);
      return newMatrix.log10();
    };

    AbstractMatrix.prototype.log2 = function log2() {
      for (let i = 0; i < this.rows; i++) {
        for (let j = 0; j < this.columns; j++) {
          this.set(i, j, Math.log2(this.get(i, j)));
        }
      }
      return this;
    };

    AbstractMatrix.log2 = function log2(matrix) {
      const newMatrix = new Matrix(matrix);
      return newMatrix.log2();
    };

    AbstractMatrix.prototype.round = function round() {
      for (let i = 0; i < this.rows; i++) {
        for (let j = 0; j < this.columns; j++) {
          this.set(i, j, Math.round(this.get(i, j)));
        }
      }
      return this;
    };

    AbstractMatrix.round = function round(matrix) {
      const newMatrix = new Matrix(matrix);
      return newMatrix.round();
    };

    AbstractMatrix.prototype.sign = function sign() {
      for (let i = 0; i < this.rows; i++) {
        for (let j = 0; j < this.columns; j++) {
          this.set(i, j, Math.sign(this.get(i, j)));
        }
      }
      return this;
    };

    AbstractMatrix.sign = function sign(matrix) {
      const newMatrix = new Matrix(matrix);
      return newMatrix.sign();
    };

    AbstractMatrix.prototype.sin = function sin() {
      for (let i = 0; i < this.rows; i++) {
        for (let j = 0; j < this.columns; j++) {
          this.set(i, j, Math.sin(this.get(i, j)));
        }
      }
      return this;
    };

    AbstractMatrix.sin = function sin(matrix) {
      const newMatrix = new Matrix(matrix);
      return newMatrix.sin();
    };

    AbstractMatrix.prototype.sinh = function sinh() {
      for (let i = 0; i < this.rows; i++) {
        for (let j = 0; j < this.columns; j++) {
          this.set(i, j, Math.sinh(this.get(i, j)));
        }
      }
      return this;
    };

    AbstractMatrix.sinh = function sinh(matrix) {
      const newMatrix = new Matrix(matrix);
      return newMatrix.sinh();
    };

    AbstractMatrix.prototype.sqrt = function sqrt() {
      for (let i = 0; i < this.rows; i++) {
        for (let j = 0; j < this.columns; j++) {
          this.set(i, j, Math.sqrt(this.get(i, j)));
        }
      }
      return this;
    };

    AbstractMatrix.sqrt = function sqrt(matrix) {
      const newMatrix = new Matrix(matrix);
      return newMatrix.sqrt();
    };

    AbstractMatrix.prototype.tan = function tan() {
      for (let i = 0; i < this.rows; i++) {
        for (let j = 0; j < this.columns; j++) {
          this.set(i, j, Math.tan(this.get(i, j)));
        }
      }
      return this;
    };

    AbstractMatrix.tan = function tan(matrix) {
      const newMatrix = new Matrix(matrix);
      return newMatrix.tan();
    };

    AbstractMatrix.prototype.tanh = function tanh() {
      for (let i = 0; i < this.rows; i++) {
        for (let j = 0; j < this.columns; j++) {
          this.set(i, j, Math.tanh(this.get(i, j)));
        }
      }
      return this;
    };

    AbstractMatrix.tanh = function tanh(matrix) {
      const newMatrix = new Matrix(matrix);
      return newMatrix.tanh();
    };

    AbstractMatrix.prototype.trunc = function trunc() {
      for (let i = 0; i < this.rows; i++) {
        for (let j = 0; j < this.columns; j++) {
          this.set(i, j, Math.trunc(this.get(i, j)));
        }
      }
      return this;
    };

    AbstractMatrix.trunc = function trunc(matrix) {
      const newMatrix = new Matrix(matrix);
      return newMatrix.trunc();
    };

    AbstractMatrix.pow = function pow(matrix, arg0) {
      const newMatrix = new Matrix(matrix);
      return newMatrix.pow(arg0);
    };

    AbstractMatrix.prototype.pow = function pow(value) {
      if (typeof value === 'number') return this.powS(value);
      return this.powM(value);
    };

    AbstractMatrix.prototype.powS = function powS(value) {
      for (let i = 0; i < this.rows; i++) {
        for (let j = 0; j < this.columns; j++) {
          this.set(i, j, Math.pow(this.get(i, j), value));
        }
      }
      return this;
    };

    AbstractMatrix.prototype.powM = function powM(matrix) {
      matrix = Matrix.checkMatrix(matrix);
      if (this.rows !== matrix.rows ||
        this.columns !== matrix.columns) {
        throw new RangeError('Matrices dimensions must be equal');
      }
      for (let i = 0; i < this.rows; i++) {
        for (let j = 0; j < this.columns; j++) {
          this.set(i, j, Math.pow(this.get(i, j), matrix.get(i, j)));
        }
      }
      return this;
    };
  }

  /**
   * @private
   * Check that a row index is not out of bounds
   * @param {Matrix} matrix
   * @param {number} index
   * @param {boolean} [outer]
   */
  function checkRowIndex(matrix, index, outer) {
    let max = outer ? matrix.rows : matrix.rows - 1;
    if (index < 0 || index > max) {
      throw new RangeError('Row index out of range');
    }
  }

  /**
   * @private
   * Check that a column index is not out of bounds
   * @param {Matrix} matrix
   * @param {number} index
   * @param {boolean} [outer]
   */
  function checkColumnIndex(matrix, index, outer) {
    let max = outer ? matrix.columns : matrix.columns - 1;
    if (index < 0 || index > max) {
      throw new RangeError('Column index out of range');
    }
  }

  /**
   * @private
   * Check that the provided vector is an array with the right length
   * @param {Matrix} matrix
   * @param {Array|Matrix} vector
   * @return {Array}
   * @throws {RangeError}
   */
  function checkRowVector(matrix, vector) {
    if (vector.to1DArray) {
      vector = vector.to1DArray();
    }
    if (vector.length !== matrix.columns) {
      throw new RangeError(
        'vector size must be the same as the number of columns',
      );
    }
    return vector;
  }

  /**
   * @private
   * Check that the provided vector is an array with the right length
   * @param {Matrix} matrix
   * @param {Array|Matrix} vector
   * @return {Array}
   * @throws {RangeError}
   */
  function checkColumnVector(matrix, vector) {
    if (vector.to1DArray) {
      vector = vector.to1DArray();
    }
    if (vector.length !== matrix.rows) {
      throw new RangeError('vector size must be the same as the number of rows');
    }
    return vector;
  }

  function checkIndices(matrix, rowIndices, columnIndices) {
    return {
      row: checkRowIndices(matrix, rowIndices),
      column: checkColumnIndices(matrix, columnIndices),
    };
  }

  function checkRowIndices(matrix, rowIndices) {
    if (typeof rowIndices !== 'object') {
      throw new TypeError('unexpected type for row indices');
    }

    let rowOut = rowIndices.some((r) => {
      return r < 0 || r >= matrix.rows;
    });

    if (rowOut) {
      throw new RangeError('row indices are out of range');
    }

    if (!Array.isArray(rowIndices)) rowIndices = Array.from(rowIndices);

    return rowIndices;
  }

  function checkColumnIndices(matrix, columnIndices) {
    if (typeof columnIndices !== 'object') {
      throw new TypeError('unexpected type for column indices');
    }

    let columnOut = columnIndices.some((c) => {
      return c < 0 || c >= matrix.columns;
    });

    if (columnOut) {
      throw new RangeError('column indices are out of range');
    }
    if (!Array.isArray(columnIndices)) columnIndices = Array.from(columnIndices);

    return columnIndices;
  }

  function checkRange(matrix, startRow, endRow, startColumn, endColumn) {
    if (arguments.length !== 5) {
      throw new RangeError('expected 4 arguments');
    }
    checkNumber('startRow', startRow);
    checkNumber('endRow', endRow);
    checkNumber('startColumn', startColumn);
    checkNumber('endColumn', endColumn);
    if (
      startRow > endRow ||
      startColumn > endColumn ||
      startRow < 0 ||
      startRow >= matrix.rows ||
      endRow < 0 ||
      endRow >= matrix.rows ||
      startColumn < 0 ||
      startColumn >= matrix.columns ||
      endColumn < 0 ||
      endColumn >= matrix.columns
    ) {
      throw new RangeError('Submatrix indices are out of range');
    }
  }

  function newArray(length, value = 0) {
    let array = [];
    for (let i = 0; i < length; i++) {
      array.push(value);
    }
    return array;
  }

  function checkNumber(name, value) {
    if (typeof value !== 'number') {
      throw new TypeError(`${name} must be a number`);
    }
  }

  function sumByRow(matrix) {
    let sum = newArray(matrix.rows);
    for (let i = 0; i < matrix.rows; ++i) {
      for (let j = 0; j < matrix.columns; ++j) {
        sum[i] += matrix.get(i, j);
      }
    }
    return sum;
  }

  function sumByColumn(matrix) {
    let sum = newArray(matrix.columns);
    for (let i = 0; i < matrix.rows; ++i) {
      for (let j = 0; j < matrix.columns; ++j) {
        sum[j] += matrix.get(i, j);
      }
    }
    return sum;
  }

  function sumAll(matrix) {
    let v = 0;
    for (let i = 0; i < matrix.rows; i++) {
      for (let j = 0; j < matrix.columns; j++) {
        v += matrix.get(i, j);
      }
    }
    return v;
  }

  function productByRow(matrix) {
    let sum = newArray(matrix.rows, 1);
    for (let i = 0; i < matrix.rows; ++i) {
      for (let j = 0; j < matrix.columns; ++j) {
        sum[i] *= matrix.get(i, j);
      }
    }
    return sum;
  }

  function productByColumn(matrix) {
    let sum = newArray(matrix.columns, 1);
    for (let i = 0; i < matrix.rows; ++i) {
      for (let j = 0; j < matrix.columns; ++j) {
        sum[j] *= matrix.get(i, j);
      }
    }
    return sum;
  }

  function productAll(matrix) {
    let v = 1;
    for (let i = 0; i < matrix.rows; i++) {
      for (let j = 0; j < matrix.columns; j++) {
        v *= matrix.get(i, j);
      }
    }
    return v;
  }

  function varianceByRow(matrix, unbiased, mean) {
    const rows = matrix.rows;
    const cols = matrix.columns;
    const variance = [];

    for (let i = 0; i < rows; i++) {
      let sum1 = 0;
      let sum2 = 0;
      let x = 0;
      for (let j = 0; j < cols; j++) {
        x = matrix.get(i, j) - mean[i];
        sum1 += x;
        sum2 += x * x;
      }
      if (unbiased) {
        variance.push((sum2 - (sum1 * sum1) / cols) / (cols - 1));
      } else {
        variance.push((sum2 - (sum1 * sum1) / cols) / cols);
      }
    }
    return variance;
  }

  function varianceByColumn(matrix, unbiased, mean) {
    const rows = matrix.rows;
    const cols = matrix.columns;
    const variance = [];

    for (let j = 0; j < cols; j++) {
      let sum1 = 0;
      let sum2 = 0;
      let x = 0;
      for (let i = 0; i < rows; i++) {
        x = matrix.get(i, j) - mean[j];
        sum1 += x;
        sum2 += x * x;
      }
      if (unbiased) {
        variance.push((sum2 - (sum1 * sum1) / rows) / (rows - 1));
      } else {
        variance.push((sum2 - (sum1 * sum1) / rows) / rows);
      }
    }
    return variance;
  }

  function varianceAll(matrix, unbiased, mean) {
    const rows = matrix.rows;
    const cols = matrix.columns;
    const size = rows * cols;

    let sum1 = 0;
    let sum2 = 0;
    let x = 0;
    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < cols; j++) {
        x = matrix.get(i, j) - mean;
        sum1 += x;
        sum2 += x * x;
      }
    }
    if (unbiased) {
      return (sum2 - (sum1 * sum1) / size) / (size - 1);
    } else {
      return (sum2 - (sum1 * sum1) / size) / size;
    }
  }

  function centerByRow(matrix, mean) {
    for (let i = 0; i < matrix.rows; i++) {
      for (let j = 0; j < matrix.columns; j++) {
        matrix.set(i, j, matrix.get(i, j) - mean[i]);
      }
    }
  }

  function centerByColumn(matrix, mean) {
    for (let i = 0; i < matrix.rows; i++) {
      for (let j = 0; j < matrix.columns; j++) {
        matrix.set(i, j, matrix.get(i, j) - mean[j]);
      }
    }
  }

  function centerAll(matrix, mean) {
    for (let i = 0; i < matrix.rows; i++) {
      for (let j = 0; j < matrix.columns; j++) {
        matrix.set(i, j, matrix.get(i, j) - mean);
      }
    }
  }

  function getScaleByRow(matrix) {
    const scale = [];
    for (let i = 0; i < matrix.rows; i++) {
      let sum = 0;
      for (let j = 0; j < matrix.columns; j++) {
        sum += Math.pow(matrix.get(i, j), 2) / (matrix.columns - 1);
      }
      scale.push(Math.sqrt(sum));
    }
    return scale;
  }

  function scaleByRow(matrix, scale) {
    for (let i = 0; i < matrix.rows; i++) {
      for (let j = 0; j < matrix.columns; j++) {
        matrix.set(i, j, matrix.get(i, j) / scale[i]);
      }
    }
  }

  function getScaleByColumn(matrix) {
    const scale = [];
    for (let j = 0; j < matrix.columns; j++) {
      let sum = 0;
      for (let i = 0; i < matrix.rows; i++) {
        sum += Math.pow(matrix.get(i, j), 2) / (matrix.rows - 1);
      }
      scale.push(Math.sqrt(sum));
    }
    return scale;
  }

  function scaleByColumn(matrix, scale) {
    for (let i = 0; i < matrix.rows; i++) {
      for (let j = 0; j < matrix.columns; j++) {
        matrix.set(i, j, matrix.get(i, j) / scale[j]);
      }
    }
  }

  function getScaleAll(matrix) {
    const divider = matrix.size - 1;
    let sum = 0;
    for (let j = 0; j < matrix.columns; j++) {
      for (let i = 0; i < matrix.rows; i++) {
        sum += Math.pow(matrix.get(i, j), 2) / divider;
      }
    }
    return Math.sqrt(sum);
  }

  function scaleAll(matrix, scale) {
    for (let i = 0; i < matrix.rows; i++) {
      for (let j = 0; j < matrix.columns; j++) {
        matrix.set(i, j, matrix.get(i, j) / scale);
      }
    }
  }

  class AbstractMatrix {
    static from1DArray(newRows, newColumns, newData) {
      let length = newRows * newColumns;
      if (length !== newData.length) {
        throw new RangeError('data length does not match given dimensions');
      }
      let newMatrix = new Matrix(newRows, newColumns);
      for (let row = 0; row < newRows; row++) {
        for (let column = 0; column < newColumns; column++) {
          newMatrix.set(row, column, newData[row * newColumns + column]);
        }
      }
      return newMatrix;
    }

    static rowVector(newData) {
      let vector = new Matrix(1, newData.length);
      for (let i = 0; i < newData.length; i++) {
        vector.set(0, i, newData[i]);
      }
      return vector;
    }

    static columnVector(newData) {
      let vector = new Matrix(newData.length, 1);
      for (let i = 0; i < newData.length; i++) {
        vector.set(i, 0, newData[i]);
      }
      return vector;
    }

    static zeros(rows, columns) {
      return new Matrix(rows, columns);
    }

    static ones(rows, columns) {
      return new Matrix(rows, columns).fill(1);
    }

    static rand(rows, columns, options = {}) {
      if (typeof options !== 'object') {
        throw new TypeError('options must be an object');
      }
      const { random = Math.random } = options;
      let matrix = new Matrix(rows, columns);
      for (let i = 0; i < rows; i++) {
        for (let j = 0; j < columns; j++) {
          matrix.set(i, j, random());
        }
      }
      return matrix;
    }

    static randInt(rows, columns, options = {}) {
      if (typeof options !== 'object') {
        throw new TypeError('options must be an object');
      }
      const { min = 0, max = 1000, random = Math.random } = options;
      if (!Number.isInteger(min)) throw new TypeError('min must be an integer');
      if (!Number.isInteger(max)) throw new TypeError('max must be an integer');
      if (min >= max) throw new RangeError('min must be smaller than max');
      let interval = max - min;
      let matrix = new Matrix(rows, columns);
      for (let i = 0; i < rows; i++) {
        for (let j = 0; j < columns; j++) {
          let value = min + Math.round(random() * interval);
          matrix.set(i, j, value);
        }
      }
      return matrix;
    }

    static eye(rows, columns, value) {
      if (columns === undefined) columns = rows;
      if (value === undefined) value = 1;
      let min = Math.min(rows, columns);
      let matrix = this.zeros(rows, columns);
      for (let i = 0; i < min; i++) {
        matrix.set(i, i, value);
      }
      return matrix;
    }

    static diag(data, rows, columns) {
      let l = data.length;
      if (rows === undefined) rows = l;
      if (columns === undefined) columns = rows;
      let min = Math.min(l, rows, columns);
      let matrix = this.zeros(rows, columns);
      for (let i = 0; i < min; i++) {
        matrix.set(i, i, data[i]);
      }
      return matrix;
    }

    static min(matrix1, matrix2) {
      matrix1 = this.checkMatrix(matrix1);
      matrix2 = this.checkMatrix(matrix2);
      let rows = matrix1.rows;
      let columns = matrix1.columns;
      let result = new Matrix(rows, columns);
      for (let i = 0; i < rows; i++) {
        for (let j = 0; j < columns; j++) {
          result.set(i, j, Math.min(matrix1.get(i, j), matrix2.get(i, j)));
        }
      }
      return result;
    }

    static max(matrix1, matrix2) {
      matrix1 = this.checkMatrix(matrix1);
      matrix2 = this.checkMatrix(matrix2);
      let rows = matrix1.rows;
      let columns = matrix1.columns;
      let result = new this(rows, columns);
      for (let i = 0; i < rows; i++) {
        for (let j = 0; j < columns; j++) {
          result.set(i, j, Math.max(matrix1.get(i, j), matrix2.get(i, j)));
        }
      }
      return result;
    }

    static checkMatrix(value) {
      return AbstractMatrix.isMatrix(value) ? value : new Matrix(value);
    }

    static isMatrix(value) {
      return value != null && value.klass === 'Matrix';
    }

    get size() {
      return this.rows * this.columns;
    }

    apply(callback) {
      if (typeof callback !== 'function') {
        throw new TypeError('callback must be a function');
      }
      for (let i = 0; i < this.rows; i++) {
        for (let j = 0; j < this.columns; j++) {
          callback.call(this, i, j);
        }
      }
      return this;
    }

    to1DArray() {
      let array = [];
      for (let i = 0; i < this.rows; i++) {
        for (let j = 0; j < this.columns; j++) {
          array.push(this.get(i, j));
        }
      }
      return array;
    }

    to2DArray() {
      let copy = [];
      for (let i = 0; i < this.rows; i++) {
        copy.push([]);
        for (let j = 0; j < this.columns; j++) {
          copy[i].push(this.get(i, j));
        }
      }
      return copy;
    }

    toJSON() {
      return this.to2DArray();
    }

    isRowVector() {
      return this.rows === 1;
    }

    isColumnVector() {
      return this.columns === 1;
    }

    isVector() {
      return this.rows === 1 || this.columns === 1;
    }

    isSquare() {
      return this.rows === this.columns;
    }

    isSymmetric() {
      if (this.isSquare()) {
        for (let i = 0; i < this.rows; i++) {
          for (let j = 0; j <= i; j++) {
            if (this.get(i, j) !== this.get(j, i)) {
              return false;
            }
          }
        }
        return true;
      }
      return false;
    }

    isEchelonForm() {
      let i = 0;
      let j = 0;
      let previousColumn = -1;
      let isEchelonForm = true;
      let checked = false;
      while (i < this.rows && isEchelonForm) {
        j = 0;
        checked = false;
        while (j < this.columns && checked === false) {
          if (this.get(i, j) === 0) {
            j++;
          } else if (this.get(i, j) === 1 && j > previousColumn) {
            checked = true;
            previousColumn = j;
          } else {
            isEchelonForm = false;
            checked = true;
          }
        }
        i++;
      }
      return isEchelonForm;
    }

    isReducedEchelonForm() {
      let i = 0;
      let j = 0;
      let previousColumn = -1;
      let isReducedEchelonForm = true;
      let checked = false;
      while (i < this.rows && isReducedEchelonForm) {
        j = 0;
        checked = false;
        while (j < this.columns && checked === false) {
          if (this.get(i, j) === 0) {
            j++;
          } else if (this.get(i, j) === 1 && j > previousColumn) {
            checked = true;
            previousColumn = j;
          } else {
            isReducedEchelonForm = false;
            checked = true;
          }
        }
        for (let k = j + 1; k < this.rows; k++) {
          if (this.get(i, k) !== 0) {
            isReducedEchelonForm = false;
          }
        }
        i++;
      }
      return isReducedEchelonForm;
    }

    echelonForm() {
      let result = this.clone();
      let h = 0;
      let k = 0;
      while (h < result.rows && k < result.columns) {
        let iMax = h;
        for (let i = h; i < result.rows; i++) {
          if (result.get(i, k) > result.get(iMax, k)) {
            iMax = i;
          }
        }
        if (result.get(iMax, k) === 0) {
          k++;
        } else {
          result.swapRows(h, iMax);
          let tmp = result.get(h, k);
          for (let j = k; j < result.columns; j++) {
            result.set(h, j, result.get(h, j) / tmp);
          }
          for (let i = h + 1; i < result.rows; i++) {
            let factor = result.get(i, k) / result.get(h, k);
            result.set(i, k, 0);
            for (let j = k + 1; j < result.columns; j++) {
              result.set(i, j, result.get(i, j) - result.get(h, j) * factor);
            }
          }
          h++;
          k++;
        }
      }
      return result;
    }

    reducedEchelonForm() {
      let result = this.echelonForm();
      let m = result.columns;
      let n = result.rows;
      let h = n - 1;
      while (h >= 0) {
        if (result.maxRow(h) === 0) {
          h--;
        } else {
          let p = 0;
          let pivot = false;
          while (p < n && pivot === false) {
            if (result.get(h, p) === 1) {
              pivot = true;
            } else {
              p++;
            }
          }
          for (let i = 0; i < h; i++) {
            let factor = result.get(i, p);
            for (let j = p; j < m; j++) {
              let tmp = result.get(i, j) - factor * result.get(h, j);
              result.set(i, j, tmp);
            }
          }
          h--;
        }
      }
      return result;
    }

    set() {
      throw new Error('set method is unimplemented');
    }

    get() {
      throw new Error('get method is unimplemented');
    }

    repeat(options = {}) {
      if (typeof options !== 'object') {
        throw new TypeError('options must be an object');
      }
      const { rows = 1, columns = 1 } = options;
      if (!Number.isInteger(rows) || rows <= 0) {
        throw new TypeError('rows must be a positive integer');
      }
      if (!Number.isInteger(columns) || columns <= 0) {
        throw new TypeError('columns must be a positive integer');
      }
      let matrix = new Matrix(this.rows * rows, this.columns * columns);
      for (let i = 0; i < rows; i++) {
        for (let j = 0; j < columns; j++) {
          matrix.setSubMatrix(this, this.rows * i, this.columns * j);
        }
      }
      return matrix;
    }

    fill(value) {
      for (let i = 0; i < this.rows; i++) {
        for (let j = 0; j < this.columns; j++) {
          this.set(i, j, value);
        }
      }
      return this;
    }

    neg() {
      return this.mulS(-1);
    }

    getRow(index) {
      checkRowIndex(this, index);
      let row = [];
      for (let i = 0; i < this.columns; i++) {
        row.push(this.get(index, i));
      }
      return row;
    }

    getRowVector(index) {
      return Matrix.rowVector(this.getRow(index));
    }

    setRow(index, array) {
      checkRowIndex(this, index);
      array = checkRowVector(this, array);
      for (let i = 0; i < this.columns; i++) {
        this.set(index, i, array[i]);
      }
      return this;
    }

    swapRows(row1, row2) {
      checkRowIndex(this, row1);
      checkRowIndex(this, row2);
      for (let i = 0; i < this.columns; i++) {
        let temp = this.get(row1, i);
        this.set(row1, i, this.get(row2, i));
        this.set(row2, i, temp);
      }
      return this;
    }

    getColumn(index) {
      checkColumnIndex(this, index);
      let column = [];
      for (let i = 0; i < this.rows; i++) {
        column.push(this.get(i, index));
      }
      return column;
    }

    getColumnVector(index) {
      return Matrix.columnVector(this.getColumn(index));
    }

    setColumn(index, array) {
      checkColumnIndex(this, index);
      array = checkColumnVector(this, array);
      for (let i = 0; i < this.rows; i++) {
        this.set(i, index, array[i]);
      }
      return this;
    }

    swapColumns(column1, column2) {
      checkColumnIndex(this, column1);
      checkColumnIndex(this, column2);
      for (let i = 0; i < this.rows; i++) {
        let temp = this.get(i, column1);
        this.set(i, column1, this.get(i, column2));
        this.set(i, column2, temp);
      }
      return this;
    }

    addRowVector(vector) {
      vector = checkRowVector(this, vector);
      for (let i = 0; i < this.rows; i++) {
        for (let j = 0; j < this.columns; j++) {
          this.set(i, j, this.get(i, j) + vector[j]);
        }
      }
      return this;
    }

    subRowVector(vector) {
      vector = checkRowVector(this, vector);
      for (let i = 0; i < this.rows; i++) {
        for (let j = 0; j < this.columns; j++) {
          this.set(i, j, this.get(i, j) - vector[j]);
        }
      }
      return this;
    }

    mulRowVector(vector) {
      vector = checkRowVector(this, vector);
      for (let i = 0; i < this.rows; i++) {
        for (let j = 0; j < this.columns; j++) {
          this.set(i, j, this.get(i, j) * vector[j]);
        }
      }
      return this;
    }

    divRowVector(vector) {
      vector = checkRowVector(this, vector);
      for (let i = 0; i < this.rows; i++) {
        for (let j = 0; j < this.columns; j++) {
          this.set(i, j, this.get(i, j) / vector[j]);
        }
      }
      return this;
    }

    addColumnVector(vector) {
      vector = checkColumnVector(this, vector);
      for (let i = 0; i < this.rows; i++) {
        for (let j = 0; j < this.columns; j++) {
          this.set(i, j, this.get(i, j) + vector[i]);
        }
      }
      return this;
    }

    subColumnVector(vector) {
      vector = checkColumnVector(this, vector);
      for (let i = 0; i < this.rows; i++) {
        for (let j = 0; j < this.columns; j++) {
          this.set(i, j, this.get(i, j) - vector[i]);
        }
      }
      return this;
    }

    mulColumnVector(vector) {
      vector = checkColumnVector(this, vector);
      for (let i = 0; i < this.rows; i++) {
        for (let j = 0; j < this.columns; j++) {
          this.set(i, j, this.get(i, j) * vector[i]);
        }
      }
      return this;
    }

    divColumnVector(vector) {
      vector = checkColumnVector(this, vector);
      for (let i = 0; i < this.rows; i++) {
        for (let j = 0; j < this.columns; j++) {
          this.set(i, j, this.get(i, j) / vector[i]);
        }
      }
      return this;
    }

    mulRow(index, value) {
      checkRowIndex(this, index);
      for (let i = 0; i < this.columns; i++) {
        this.set(index, i, this.get(index, i) * value);
      }
      return this;
    }

    mulColumn(index, value) {
      checkColumnIndex(this, index);
      for (let i = 0; i < this.rows; i++) {
        this.set(i, index, this.get(i, index) * value);
      }
      return this;
    }

    max() {
      let v = this.get(0, 0);
      for (let i = 0; i < this.rows; i++) {
        for (let j = 0; j < this.columns; j++) {
          if (this.get(i, j) > v) {
            v = this.get(i, j);
          }
        }
      }
      return v;
    }

    maxIndex() {
      let v = this.get(0, 0);
      let idx = [0, 0];
      for (let i = 0; i < this.rows; i++) {
        for (let j = 0; j < this.columns; j++) {
          if (this.get(i, j) > v) {
            v = this.get(i, j);
            idx[0] = i;
            idx[1] = j;
          }
        }
      }
      return idx;
    }

    min() {
      let v = this.get(0, 0);
      for (let i = 0; i < this.rows; i++) {
        for (let j = 0; j < this.columns; j++) {
          if (this.get(i, j) < v) {
            v = this.get(i, j);
          }
        }
      }
      return v;
    }

    minIndex() {
      let v = this.get(0, 0);
      let idx = [0, 0];
      for (let i = 0; i < this.rows; i++) {
        for (let j = 0; j < this.columns; j++) {
          if (this.get(i, j) < v) {
            v = this.get(i, j);
            idx[0] = i;
            idx[1] = j;
          }
        }
      }
      return idx;
    }

    maxRow(row) {
      checkRowIndex(this, row);
      let v = this.get(row, 0);
      for (let i = 1; i < this.columns; i++) {
        if (this.get(row, i) > v) {
          v = this.get(row, i);
        }
      }
      return v;
    }

    maxRowIndex(row) {
      checkRowIndex(this, row);
      let v = this.get(row, 0);
      let idx = [row, 0];
      for (let i = 1; i < this.columns; i++) {
        if (this.get(row, i) > v) {
          v = this.get(row, i);
          idx[1] = i;
        }
      }
      return idx;
    }

    minRow(row) {
      checkRowIndex(this, row);
      let v = this.get(row, 0);
      for (let i = 1; i < this.columns; i++) {
        if (this.get(row, i) < v) {
          v = this.get(row, i);
        }
      }
      return v;
    }

    minRowIndex(row) {
      checkRowIndex(this, row);
      let v = this.get(row, 0);
      let idx = [row, 0];
      for (let i = 1; i < this.columns; i++) {
        if (this.get(row, i) < v) {
          v = this.get(row, i);
          idx[1] = i;
        }
      }
      return idx;
    }

    maxColumn(column) {
      checkColumnIndex(this, column);
      let v = this.get(0, column);
      for (let i = 1; i < this.rows; i++) {
        if (this.get(i, column) > v) {
          v = this.get(i, column);
        }
      }
      return v;
    }

    maxColumnIndex(column) {
      checkColumnIndex(this, column);
      let v = this.get(0, column);
      let idx = [0, column];
      for (let i = 1; i < this.rows; i++) {
        if (this.get(i, column) > v) {
          v = this.get(i, column);
          idx[0] = i;
        }
      }
      return idx;
    }

    minColumn(column) {
      checkColumnIndex(this, column);
      let v = this.get(0, column);
      for (let i = 1; i < this.rows; i++) {
        if (this.get(i, column) < v) {
          v = this.get(i, column);
        }
      }
      return v;
    }

    minColumnIndex(column) {
      checkColumnIndex(this, column);
      let v = this.get(0, column);
      let idx = [0, column];
      for (let i = 1; i < this.rows; i++) {
        if (this.get(i, column) < v) {
          v = this.get(i, column);
          idx[0] = i;
        }
      }
      return idx;
    }

    diag() {
      let min = Math.min(this.rows, this.columns);
      let diag = [];
      for (let i = 0; i < min; i++) {
        diag.push(this.get(i, i));
      }
      return diag;
    }

    norm(type = 'frobenius') {
      let result = 0;
      if (type === 'max') {
        return this.max();
      } else if (type === 'frobenius') {
        for (let i = 0; i < this.rows; i++) {
          for (let j = 0; j < this.columns; j++) {
            result = result + this.get(i, j) * this.get(i, j);
          }
        }
        return Math.sqrt(result);
      } else {
        throw new RangeError(`unknown norm type: ${type}`);
      }
    }

    cumulativeSum() {
      let sum = 0;
      for (let i = 0; i < this.rows; i++) {
        for (let j = 0; j < this.columns; j++) {
          sum += this.get(i, j);
          this.set(i, j, sum);
        }
      }
      return this;
    }

    dot(vector2) {
      if (AbstractMatrix.isMatrix(vector2)) vector2 = vector2.to1DArray();
      let vector1 = this.to1DArray();
      if (vector1.length !== vector2.length) {
        throw new RangeError('vectors do not have the same size');
      }
      let dot = 0;
      for (let i = 0; i < vector1.length; i++) {
        dot += vector1[i] * vector2[i];
      }
      return dot;
    }

    mmul(other) {
      other = Matrix.checkMatrix(other);

      let m = this.rows;
      let n = this.columns;
      let p = other.columns;

      let result = new Matrix(m, p);

      let Bcolj = new Float64Array(n);
      for (let j = 0; j < p; j++) {
        for (let k = 0; k < n; k++) {
          Bcolj[k] = other.get(k, j);
        }

        for (let i = 0; i < m; i++) {
          let s = 0;
          for (let k = 0; k < n; k++) {
            s += this.get(i, k) * Bcolj[k];
          }

          result.set(i, j, s);
        }
      }
      return result;
    }

    strassen2x2(other) {
      other = Matrix.checkMatrix(other);
      let result = new Matrix(2, 2);
      const a11 = this.get(0, 0);
      const b11 = other.get(0, 0);
      const a12 = this.get(0, 1);
      const b12 = other.get(0, 1);
      const a21 = this.get(1, 0);
      const b21 = other.get(1, 0);
      const a22 = this.get(1, 1);
      const b22 = other.get(1, 1);

      // Compute intermediate values.
      const m1 = (a11 + a22) * (b11 + b22);
      const m2 = (a21 + a22) * b11;
      const m3 = a11 * (b12 - b22);
      const m4 = a22 * (b21 - b11);
      const m5 = (a11 + a12) * b22;
      const m6 = (a21 - a11) * (b11 + b12);
      const m7 = (a12 - a22) * (b21 + b22);

      // Combine intermediate values into the output.
      const c00 = m1 + m4 - m5 + m7;
      const c01 = m3 + m5;
      const c10 = m2 + m4;
      const c11 = m1 - m2 + m3 + m6;

      result.set(0, 0, c00);
      result.set(0, 1, c01);
      result.set(1, 0, c10);
      result.set(1, 1, c11);
      return result;
    }

    strassen3x3(other) {
      other = Matrix.checkMatrix(other);
      let result = new Matrix(3, 3);

      const a00 = this.get(0, 0);
      const a01 = this.get(0, 1);
      const a02 = this.get(0, 2);
      const a10 = this.get(1, 0);
      const a11 = this.get(1, 1);
      const a12 = this.get(1, 2);
      const a20 = this.get(2, 0);
      const a21 = this.get(2, 1);
      const a22 = this.get(2, 2);

      const b00 = other.get(0, 0);
      const b01 = other.get(0, 1);
      const b02 = other.get(0, 2);
      const b10 = other.get(1, 0);
      const b11 = other.get(1, 1);
      const b12 = other.get(1, 2);
      const b20 = other.get(2, 0);
      const b21 = other.get(2, 1);
      const b22 = other.get(2, 2);

      const m1 = (a00 + a01 + a02 - a10 - a11 - a21 - a22) * b11;
      const m2 = (a00 - a10) * (-b01 + b11);
      const m3 = a11 * (-b00 + b01 + b10 - b11 - b12 - b20 + b22);
      const m4 = (-a00 + a10 + a11) * (b00 - b01 + b11);
      const m5 = (a10 + a11) * (-b00 + b01);
      const m6 = a00 * b00;
      const m7 = (-a00 + a20 + a21) * (b00 - b02 + b12);
      const m8 = (-a00 + a20) * (b02 - b12);
      const m9 = (a20 + a21) * (-b00 + b02);
      const m10 = (a00 + a01 + a02 - a11 - a12 - a20 - a21) * b12;
      const m11 = a21 * (-b00 + b02 + b10 - b11 - b12 - b20 + b21);
      const m12 = (-a02 + a21 + a22) * (b11 + b20 - b21);
      const m13 = (a02 - a22) * (b11 - b21);
      const m14 = a02 * b20;
      const m15 = (a21 + a22) * (-b20 + b21);
      const m16 = (-a02 + a11 + a12) * (b12 + b20 - b22);
      const m17 = (a02 - a12) * (b12 - b22);
      const m18 = (a11 + a12) * (-b20 + b22);
      const m19 = a01 * b10;
      const m20 = a12 * b21;
      const m21 = a10 * b02;
      const m22 = a20 * b01;
      const m23 = a22 * b22;

      const c00 = m6 + m14 + m19;
      const c01 = m1 + m4 + m5 + m6 + m12 + m14 + m15;
      const c02 = m6 + m7 + m9 + m10 + m14 + m16 + m18;
      const c10 = m2 + m3 + m4 + m6 + m14 + m16 + m17;
      const c11 = m2 + m4 + m5 + m6 + m20;
      const c12 = m14 + m16 + m17 + m18 + m21;
      const c20 = m6 + m7 + m8 + m11 + m12 + m13 + m14;
      const c21 = m12 + m13 + m14 + m15 + m22;
      const c22 = m6 + m7 + m8 + m9 + m23;

      result.set(0, 0, c00);
      result.set(0, 1, c01);
      result.set(0, 2, c02);
      result.set(1, 0, c10);
      result.set(1, 1, c11);
      result.set(1, 2, c12);
      result.set(2, 0, c20);
      result.set(2, 1, c21);
      result.set(2, 2, c22);
      return result;
    }

    mmulStrassen(y) {
      y = Matrix.checkMatrix(y);
      let x = this.clone();
      let r1 = x.rows;
      let c1 = x.columns;
      let r2 = y.rows;
      let c2 = y.columns;
      if (c1 !== r2) {
        // eslint-disable-next-line no-console
        console.warn(
          `Multiplying ${r1} x ${c1} and ${r2} x ${c2} matrix: dimensions do not match.`,
        );
      }

      // Put a matrix into the top left of a matrix of zeros.
      // `rows` and `cols` are the dimensions of the output matrix.
      function embed(mat, rows, cols) {
        let r = mat.rows;
        let c = mat.columns;
        if (r === rows && c === cols) {
          return mat;
        } else {
          let resultat = AbstractMatrix.zeros(rows, cols);
          resultat = resultat.setSubMatrix(mat, 0, 0);
          return resultat;
        }
      }

      // Make sure both matrices are the same size.
      // This is exclusively for simplicity:
      // this algorithm can be implemented with matrices of different sizes.

      let r = Math.max(r1, r2);
      let c = Math.max(c1, c2);
      x = embed(x, r, c);
      y = embed(y, r, c);

      // Our recursive multiplication function.
      function blockMult(a, b, rows, cols) {
        // For small matrices, resort to naive multiplication.
        if (rows <= 512 || cols <= 512) {
          return a.mmul(b); // a is equivalent to this
        }

        // Apply dynamic padding.
        if (rows % 2 === 1 && cols % 2 === 1) {
          a = embed(a, rows + 1, cols + 1);
          b = embed(b, rows + 1, cols + 1);
        } else if (rows % 2 === 1) {
          a = embed(a, rows + 1, cols);
          b = embed(b, rows + 1, cols);
        } else if (cols % 2 === 1) {
          a = embed(a, rows, cols + 1);
          b = embed(b, rows, cols + 1);
        }

        let halfRows = parseInt(a.rows / 2, 10);
        let halfCols = parseInt(a.columns / 2, 10);
        // Subdivide input matrices.
        let a11 = a.subMatrix(0, halfRows - 1, 0, halfCols - 1);
        let b11 = b.subMatrix(0, halfRows - 1, 0, halfCols - 1);

        let a12 = a.subMatrix(0, halfRows - 1, halfCols, a.columns - 1);
        let b12 = b.subMatrix(0, halfRows - 1, halfCols, b.columns - 1);

        let a21 = a.subMatrix(halfRows, a.rows - 1, 0, halfCols - 1);
        let b21 = b.subMatrix(halfRows, b.rows - 1, 0, halfCols - 1);

        let a22 = a.subMatrix(halfRows, a.rows - 1, halfCols, a.columns - 1);
        let b22 = b.subMatrix(halfRows, b.rows - 1, halfCols, b.columns - 1);

        // Compute intermediate values.
        let m1 = blockMult(
          AbstractMatrix.add(a11, a22),
          AbstractMatrix.add(b11, b22),
          halfRows,
          halfCols,
        );
        let m2 = blockMult(AbstractMatrix.add(a21, a22), b11, halfRows, halfCols);
        let m3 = blockMult(a11, AbstractMatrix.sub(b12, b22), halfRows, halfCols);
        let m4 = blockMult(a22, AbstractMatrix.sub(b21, b11), halfRows, halfCols);
        let m5 = blockMult(AbstractMatrix.add(a11, a12), b22, halfRows, halfCols);
        let m6 = blockMult(
          AbstractMatrix.sub(a21, a11),
          AbstractMatrix.add(b11, b12),
          halfRows,
          halfCols,
        );
        let m7 = blockMult(
          AbstractMatrix.sub(a12, a22),
          AbstractMatrix.add(b21, b22),
          halfRows,
          halfCols,
        );

        // Combine intermediate values into the output.
        let c11 = AbstractMatrix.add(m1, m4);
        c11.sub(m5);
        c11.add(m7);
        let c12 = AbstractMatrix.add(m3, m5);
        let c21 = AbstractMatrix.add(m2, m4);
        let c22 = AbstractMatrix.sub(m1, m2);
        c22.add(m3);
        c22.add(m6);

        // Crop output to the desired size (undo dynamic padding).
        let resultat = AbstractMatrix.zeros(2 * c11.rows, 2 * c11.columns);
        resultat = resultat.setSubMatrix(c11, 0, 0);
        resultat = resultat.setSubMatrix(c12, c11.rows, 0);
        resultat = resultat.setSubMatrix(c21, 0, c11.columns);
        resultat = resultat.setSubMatrix(c22, c11.rows, c11.columns);
        return resultat.subMatrix(0, rows - 1, 0, cols - 1);
      }
      return blockMult(x, y, r, c);
    }

    scaleRows(options = {}) {
      if (typeof options !== 'object') {
        throw new TypeError('options must be an object');
      }
      const { min = 0, max = 1 } = options;
      if (!Number.isFinite(min)) throw new TypeError('min must be a number');
      if (!Number.isFinite(max)) throw new TypeError('max must be a number');
      if (min >= max) throw new RangeError('min must be smaller than max');
      let newMatrix = new Matrix(this.rows, this.columns);
      for (let i = 0; i < this.rows; i++) {
        const row = this.getRow(i);
        rescale(row, { min, max, output: row });
        newMatrix.setRow(i, row);
      }
      return newMatrix;
    }

    scaleColumns(options = {}) {
      if (typeof options !== 'object') {
        throw new TypeError('options must be an object');
      }
      const { min = 0, max = 1 } = options;
      if (!Number.isFinite(min)) throw new TypeError('min must be a number');
      if (!Number.isFinite(max)) throw new TypeError('max must be a number');
      if (min >= max) throw new RangeError('min must be smaller than max');
      let newMatrix = new Matrix(this.rows, this.columns);
      for (let i = 0; i < this.columns; i++) {
        const column = this.getColumn(i);
        rescale(column, {
          min: min,
          max: max,
          output: column,
        });
        newMatrix.setColumn(i, column);
      }
      return newMatrix;
    }

    flipRows() {
      const middle = Math.ceil(this.columns / 2);
      for (let i = 0; i < this.rows; i++) {
        for (let j = 0; j < middle; j++) {
          let first = this.get(i, j);
          let last = this.get(i, this.columns - 1 - j);
          this.set(i, j, last);
          this.set(i, this.columns - 1 - j, first);
        }
      }
      return this;
    }

    flipColumns() {
      const middle = Math.ceil(this.rows / 2);
      for (let j = 0; j < this.columns; j++) {
        for (let i = 0; i < middle; i++) {
          let first = this.get(i, j);
          let last = this.get(this.rows - 1 - i, j);
          this.set(i, j, last);
          this.set(this.rows - 1 - i, j, first);
        }
      }
      return this;
    }

    kroneckerProduct(other) {
      other = Matrix.checkMatrix(other);

      let m = this.rows;
      let n = this.columns;
      let p = other.rows;
      let q = other.columns;

      let result = new Matrix(m * p, n * q);
      for (let i = 0; i < m; i++) {
        for (let j = 0; j < n; j++) {
          for (let k = 0; k < p; k++) {
            for (let l = 0; l < q; l++) {
              result.set(p * i + k, q * j + l, this.get(i, j) * other.get(k, l));
            }
          }
        }
      }
      return result;
    }

    transpose() {
      let result = new Matrix(this.columns, this.rows);
      for (let i = 0; i < this.rows; i++) {
        for (let j = 0; j < this.columns; j++) {
          result.set(j, i, this.get(i, j));
        }
      }
      return result;
    }

    sortRows(compareFunction = compareNumbers) {
      for (let i = 0; i < this.rows; i++) {
        this.setRow(i, this.getRow(i).sort(compareFunction));
      }
      return this;
    }

    sortColumns(compareFunction = compareNumbers) {
      for (let i = 0; i < this.columns; i++) {
        this.setColumn(i, this.getColumn(i).sort(compareFunction));
      }
      return this;
    }

    subMatrix(startRow, endRow, startColumn, endColumn) {
      checkRange(this, startRow, endRow, startColumn, endColumn);
      let newMatrix = new Matrix(
        endRow - startRow + 1,
        endColumn - startColumn + 1,
      );
      for (let i = startRow; i <= endRow; i++) {
        for (let j = startColumn; j <= endColumn; j++) {
          newMatrix.set(i - startRow, j - startColumn, this.get(i, j));
        }
      }
      return newMatrix;
    }

    subMatrixRow(indices, startColumn, endColumn) {
      if (startColumn === undefined) startColumn = 0;
      if (endColumn === undefined) endColumn = this.columns - 1;
      if (
        startColumn > endColumn ||
        startColumn < 0 ||
        startColumn >= this.columns ||
        endColumn < 0 ||
        endColumn >= this.columns
      ) {
        throw new RangeError('Argument out of range');
      }

      let newMatrix = new Matrix(indices.length, endColumn - startColumn + 1);
      for (let i = 0; i < indices.length; i++) {
        for (let j = startColumn; j <= endColumn; j++) {
          if (indices[i] < 0 || indices[i] >= this.rows) {
            throw new RangeError(`Row index out of range: ${indices[i]}`);
          }
          newMatrix.set(i, j - startColumn, this.get(indices[i], j));
        }
      }
      return newMatrix;
    }

    subMatrixColumn(indices, startRow, endRow) {
      if (startRow === undefined) startRow = 0;
      if (endRow === undefined) endRow = this.rows - 1;
      if (
        startRow > endRow ||
        startRow < 0 ||
        startRow >= this.rows ||
        endRow < 0 ||
        endRow >= this.rows
      ) {
        throw new RangeError('Argument out of range');
      }

      let newMatrix = new Matrix(endRow - startRow + 1, indices.length);
      for (let i = 0; i < indices.length; i++) {
        for (let j = startRow; j <= endRow; j++) {
          if (indices[i] < 0 || indices[i] >= this.columns) {
            throw new RangeError(`Column index out of range: ${indices[i]}`);
          }
          newMatrix.set(j - startRow, i, this.get(j, indices[i]));
        }
      }
      return newMatrix;
    }

    setSubMatrix(matrix, startRow, startColumn) {
      matrix = Matrix.checkMatrix(matrix);
      let endRow = startRow + matrix.rows - 1;
      let endColumn = startColumn + matrix.columns - 1;
      checkRange(this, startRow, endRow, startColumn, endColumn);
      for (let i = 0; i < matrix.rows; i++) {
        for (let j = 0; j < matrix.columns; j++) {
          this.set(startRow + i, startColumn + j, matrix.get(i, j));
        }
      }
      return this;
    }

    selection(rowIndices, columnIndices) {
      let indices = checkIndices(this, rowIndices, columnIndices);
      let newMatrix = new Matrix(rowIndices.length, columnIndices.length);
      for (let i = 0; i < indices.row.length; i++) {
        let rowIndex = indices.row[i];
        for (let j = 0; j < indices.column.length; j++) {
          let columnIndex = indices.column[j];
          newMatrix.set(i, j, this.get(rowIndex, columnIndex));
        }
      }
      return newMatrix;
    }

    trace() {
      let min = Math.min(this.rows, this.columns);
      let trace = 0;
      for (let i = 0; i < min; i++) {
        trace += this.get(i, i);
      }
      return trace;
    }

    clone() {
      let newMatrix = new Matrix(this.rows, this.columns);
      for (let row = 0; row < this.rows; row++) {
        for (let column = 0; column < this.columns; column++) {
          newMatrix.set(row, column, this.get(row, column));
        }
      }
      return newMatrix;
    }

    sum(by) {
      switch (by) {
        case 'row':
          return sumByRow(this);
        case 'column':
          return sumByColumn(this);
        case undefined:
          return sumAll(this);
        default:
          throw new Error(`invalid option: ${by}`);
      }
    }

    product(by) {
      switch (by) {
        case 'row':
          return productByRow(this);
        case 'column':
          return productByColumn(this);
        case undefined:
          return productAll(this);
        default:
          throw new Error(`invalid option: ${by}`);
      }
    }

    mean(by) {
      const sum = this.sum(by);
      switch (by) {
        case 'row': {
          for (let i = 0; i < this.rows; i++) {
            sum[i] /= this.columns;
          }
          return sum;
        }
        case 'column': {
          for (let i = 0; i < this.columns; i++) {
            sum[i] /= this.rows;
          }
          return sum;
        }
        case undefined:
          return sum / this.size;
        default:
          throw new Error(`invalid option: ${by}`);
      }
    }

    variance(by, options = {}) {
      if (typeof by === 'object') {
        options = by;
        by = undefined;
      }
      if (typeof options !== 'object') {
        throw new TypeError('options must be an object');
      }
      const { unbiased = true, mean = this.mean(by) } = options;
      if (typeof unbiased !== 'boolean') {
        throw new TypeError('unbiased must be a boolean');
      }
      switch (by) {
        case 'row': {
          if (!Array.isArray(mean)) {
            throw new TypeError('mean must be an array');
          }
          return varianceByRow(this, unbiased, mean);
        }
        case 'column': {
          if (!Array.isArray(mean)) {
            throw new TypeError('mean must be an array');
          }
          return varianceByColumn(this, unbiased, mean);
        }
        case undefined: {
          if (typeof mean !== 'number') {
            throw new TypeError('mean must be a number');
          }
          return varianceAll(this, unbiased, mean);
        }
        default:
          throw new Error(`invalid option: ${by}`);
      }
    }

    standardDeviation(by, options) {
      if (typeof by === 'object') {
        options = by;
        by = undefined;
      }
      const variance = this.variance(by, options);
      if (by === undefined) {
        return Math.sqrt(variance);
      } else {
        for (let i = 0; i < variance.length; i++) {
          variance[i] = Math.sqrt(variance[i]);
        }
        return variance;
      }
    }

    center(by, options = {}) {
      if (typeof by === 'object') {
        options = by;
        by = undefined;
      }
      if (typeof options !== 'object') {
        throw new TypeError('options must be an object');
      }
      const { center = this.mean(by) } = options;
      switch (by) {
        case 'row': {
          if (!Array.isArray(center)) {
            throw new TypeError('center must be an array');
          }
          centerByRow(this, center);
          return this;
        }
        case 'column': {
          if (!Array.isArray(center)) {
            throw new TypeError('center must be an array');
          }
          centerByColumn(this, center);
          return this;
        }
        case undefined: {
          if (typeof center !== 'number') {
            throw new TypeError('center must be a number');
          }
          centerAll(this, center);
          return this;
        }
        default:
          throw new Error(`invalid option: ${by}`);
      }
    }

    scale(by, options = {}) {
      if (typeof by === 'object') {
        options = by;
        by = undefined;
      }
      if (typeof options !== 'object') {
        throw new TypeError('options must be an object');
      }
      let scale = options.scale;
      switch (by) {
        case 'row': {
          if (scale === undefined) {
            scale = getScaleByRow(this);
          } else if (!Array.isArray(scale)) {
            throw new TypeError('scale must be an array');
          }
          scaleByRow(this, scale);
          return this;
        }
        case 'column': {
          if (scale === undefined) {
            scale = getScaleByColumn(this);
          } else if (!Array.isArray(scale)) {
            throw new TypeError('scale must be an array');
          }
          scaleByColumn(this, scale);
          return this;
        }
        case undefined: {
          if (scale === undefined) {
            scale = getScaleAll(this);
          } else if (typeof scale !== 'number') {
            throw new TypeError('scale must be a number');
          }
          scaleAll(this, scale);
          return this;
        }
        default:
          throw new Error(`invalid option: ${by}`);
      }
    }

    toString(options) {
      return inspectMatrixWithOptions(this, options);
    }
  }

  AbstractMatrix.prototype.klass = 'Matrix';
  if (typeof Symbol !== 'undefined') {
    AbstractMatrix.prototype[
      Symbol.for('nodejs.util.inspect.custom')
    ] = inspectMatrix;
  }

  function compareNumbers(a, b) {
    return a - b;
  }

  // Synonyms
  AbstractMatrix.random = AbstractMatrix.rand;
  AbstractMatrix.randomInt = AbstractMatrix.randInt;
  AbstractMatrix.diagonal = AbstractMatrix.diag;
  AbstractMatrix.prototype.diagonal = AbstractMatrix.prototype.diag;
  AbstractMatrix.identity = AbstractMatrix.eye;
  AbstractMatrix.prototype.negate = AbstractMatrix.prototype.neg;
  AbstractMatrix.prototype.tensorProduct =
    AbstractMatrix.prototype.kroneckerProduct;

  class Matrix extends AbstractMatrix {
    constructor(nRows, nColumns) {
      super();
      if (Matrix.isMatrix(nRows)) {
        return nRows.clone();
      } else if (Number.isInteger(nRows) && nRows > 0) {
        // Create an empty matrix
        this.data = [];
        if (Number.isInteger(nColumns) && nColumns > 0) {
          for (let i = 0; i < nRows; i++) {
            this.data.push(new Float64Array(nColumns));
          }
        } else {
          throw new TypeError('nColumns must be a positive integer');
        }
      } else if (Array.isArray(nRows)) {
        // Copy the values from the 2D array
        const arrayData = nRows;
        nRows = arrayData.length;
        nColumns = arrayData[0].length;
        if (typeof nColumns !== 'number' || nColumns === 0) {
          throw new TypeError(
            'Data must be a 2D array with at least one element',
          );
        }
        this.data = [];
        for (let i = 0; i < nRows; i++) {
          if (arrayData[i].length !== nColumns) {
            throw new RangeError('Inconsistent array dimensions');
          }
          this.data.push(Float64Array.from(arrayData[i]));
        }
      } else {
        throw new TypeError(
          'First argument must be a positive number or an array',
        );
      }
      this.rows = nRows;
      this.columns = nColumns;
      return this;
    }

    set(rowIndex, columnIndex, value) {
      this.data[rowIndex][columnIndex] = value;
      return this;
    }

    get(rowIndex, columnIndex) {
      return this.data[rowIndex][columnIndex];
    }

    removeRow(index) {
      checkRowIndex(this, index);
      if (this.rows === 1) {
        throw new RangeError('A matrix cannot have less than one row');
      }
      this.data.splice(index, 1);
      this.rows -= 1;
      return this;
    }

    addRow(index, array) {
      if (array === undefined) {
        array = index;
        index = this.rows;
      }
      checkRowIndex(this, index, true);
      array = Float64Array.from(checkRowVector(this, array));
      this.data.splice(index, 0, array);
      this.rows += 1;
      return this;
    }

    removeColumn(index) {
      checkColumnIndex(this, index);
      if (this.columns === 1) {
        throw new RangeError('A matrix cannot have less than one column');
      }
      for (let i = 0; i < this.rows; i++) {
        const newRow = new Float64Array(this.columns - 1);
        for (let j = 0; j < index; j++) {
          newRow[j] = this.data[i][j];
        }
        for (let j = index + 1; j < this.columns; j++) {
          newRow[j - 1] = this.data[i][j];
        }
        this.data[i] = newRow;
      }
      this.columns -= 1;
      return this;
    }

    addColumn(index, array) {
      if (typeof array === 'undefined') {
        array = index;
        index = this.columns;
      }
      checkColumnIndex(this, index, true);
      array = checkColumnVector(this, array);
      for (let i = 0; i < this.rows; i++) {
        const newRow = new Float64Array(this.columns + 1);
        let j = 0;
        for (; j < index; j++) {
          newRow[j] = this.data[i][j];
        }
        newRow[j++] = array[i];
        for (; j < this.columns + 1; j++) {
          newRow[j] = this.data[i][j - 1];
        }
        this.data[i] = newRow;
      }
      this.columns += 1;
      return this;
    }
  }

  installMathOperations(AbstractMatrix, Matrix);

  class WrapperMatrix2D extends AbstractMatrix {
    constructor(data) {
      super();
      this.data = data;
      this.rows = data.length;
      this.columns = data[0].length;
    }

    set(rowIndex, columnIndex, value) {
      this.data[rowIndex][columnIndex] = value;
      return this;
    }

    get(rowIndex, columnIndex) {
      return this.data[rowIndex][columnIndex];
    }
  }

  class LuDecomposition {
    constructor(matrix) {
      matrix = WrapperMatrix2D.checkMatrix(matrix);

      let lu = matrix.clone();
      let rows = lu.rows;
      let columns = lu.columns;
      let pivotVector = new Float64Array(rows);
      let pivotSign = 1;
      let i, j, k, p, s, t, v;
      let LUcolj, kmax;

      for (i = 0; i < rows; i++) {
        pivotVector[i] = i;
      }

      LUcolj = new Float64Array(rows);

      for (j = 0; j < columns; j++) {
        for (i = 0; i < rows; i++) {
          LUcolj[i] = lu.get(i, j);
        }

        for (i = 0; i < rows; i++) {
          kmax = Math.min(i, j);
          s = 0;
          for (k = 0; k < kmax; k++) {
            s += lu.get(i, k) * LUcolj[k];
          }
          LUcolj[i] -= s;
          lu.set(i, j, LUcolj[i]);
        }

        p = j;
        for (i = j + 1; i < rows; i++) {
          if (Math.abs(LUcolj[i]) > Math.abs(LUcolj[p])) {
            p = i;
          }
        }

        if (p !== j) {
          for (k = 0; k < columns; k++) {
            t = lu.get(p, k);
            lu.set(p, k, lu.get(j, k));
            lu.set(j, k, t);
          }

          v = pivotVector[p];
          pivotVector[p] = pivotVector[j];
          pivotVector[j] = v;

          pivotSign = -pivotSign;
        }

        if (j < rows && lu.get(j, j) !== 0) {
          for (i = j + 1; i < rows; i++) {
            lu.set(i, j, lu.get(i, j) / lu.get(j, j));
          }
        }
      }

      this.LU = lu;
      this.pivotVector = pivotVector;
      this.pivotSign = pivotSign;
    }

    isSingular() {
      let data = this.LU;
      let col = data.columns;
      for (let j = 0; j < col; j++) {
        if (data.get(j, j) === 0) {
          return true;
        }
      }
      return false;
    }

    solve(value) {
      value = Matrix.checkMatrix(value);

      let lu = this.LU;
      let rows = lu.rows;

      if (rows !== value.rows) {
        throw new Error('Invalid matrix dimensions');
      }
      if (this.isSingular()) {
        throw new Error('LU matrix is singular');
      }

      let count = value.columns;
      let X = value.subMatrixRow(this.pivotVector, 0, count - 1);
      let columns = lu.columns;
      let i, j, k;

      for (k = 0; k < columns; k++) {
        for (i = k + 1; i < columns; i++) {
          for (j = 0; j < count; j++) {
            X.set(i, j, X.get(i, j) - X.get(k, j) * lu.get(i, k));
          }
        }
      }
      for (k = columns - 1; k >= 0; k--) {
        for (j = 0; j < count; j++) {
          X.set(k, j, X.get(k, j) / lu.get(k, k));
        }
        for (i = 0; i < k; i++) {
          for (j = 0; j < count; j++) {
            X.set(i, j, X.get(i, j) - X.get(k, j) * lu.get(i, k));
          }
        }
      }
      return X;
    }

    get determinant() {
      let data = this.LU;
      if (!data.isSquare()) {
        throw new Error('Matrix must be square');
      }
      let determinant = this.pivotSign;
      let col = data.columns;
      for (let j = 0; j < col; j++) {
        determinant *= data.get(j, j);
      }
      return determinant;
    }

    get lowerTriangularMatrix() {
      let data = this.LU;
      let rows = data.rows;
      let columns = data.columns;
      let X = new Matrix(rows, columns);
      for (let i = 0; i < rows; i++) {
        for (let j = 0; j < columns; j++) {
          if (i > j) {
            X.set(i, j, data.get(i, j));
          } else if (i === j) {
            X.set(i, j, 1);
          } else {
            X.set(i, j, 0);
          }
        }
      }
      return X;
    }

    get upperTriangularMatrix() {
      let data = this.LU;
      let rows = data.rows;
      let columns = data.columns;
      let X = new Matrix(rows, columns);
      for (let i = 0; i < rows; i++) {
        for (let j = 0; j < columns; j++) {
          if (i <= j) {
            X.set(i, j, data.get(i, j));
          } else {
            X.set(i, j, 0);
          }
        }
      }
      return X;
    }

    get pivotPermutationVector() {
      return Array.from(this.pivotVector);
    }
  }

  function hypotenuse(a, b) {
    let r = 0;
    if (Math.abs(a) > Math.abs(b)) {
      r = b / a;
      return Math.abs(a) * Math.sqrt(1 + r * r);
    }
    if (b !== 0) {
      r = a / b;
      return Math.abs(b) * Math.sqrt(1 + r * r);
    }
    return 0;
  }

  class QrDecomposition {
    constructor(value) {
      value = WrapperMatrix2D.checkMatrix(value);

      let qr = value.clone();
      let m = value.rows;
      let n = value.columns;
      let rdiag = new Float64Array(n);
      let i, j, k, s;

      for (k = 0; k < n; k++) {
        let nrm = 0;
        for (i = k; i < m; i++) {
          nrm = hypotenuse(nrm, qr.get(i, k));
        }
        if (nrm !== 0) {
          if (qr.get(k, k) < 0) {
            nrm = -nrm;
          }
          for (i = k; i < m; i++) {
            qr.set(i, k, qr.get(i, k) / nrm);
          }
          qr.set(k, k, qr.get(k, k) + 1);
          for (j = k + 1; j < n; j++) {
            s = 0;
            for (i = k; i < m; i++) {
              s += qr.get(i, k) * qr.get(i, j);
            }
            s = -s / qr.get(k, k);
            for (i = k; i < m; i++) {
              qr.set(i, j, qr.get(i, j) + s * qr.get(i, k));
            }
          }
        }
        rdiag[k] = -nrm;
      }

      this.QR = qr;
      this.Rdiag = rdiag;
    }

    solve(value) {
      value = Matrix.checkMatrix(value);

      let qr = this.QR;
      let m = qr.rows;

      if (value.rows !== m) {
        throw new Error('Matrix row dimensions must agree');
      }
      if (!this.isFullRank()) {
        throw new Error('Matrix is rank deficient');
      }

      let count = value.columns;
      let X = value.clone();
      let n = qr.columns;
      let i, j, k, s;

      for (k = 0; k < n; k++) {
        for (j = 0; j < count; j++) {
          s = 0;
          for (i = k; i < m; i++) {
            s += qr.get(i, k) * X.get(i, j);
          }
          s = -s / qr.get(k, k);
          for (i = k; i < m; i++) {
            X.set(i, j, X.get(i, j) + s * qr.get(i, k));
          }
        }
      }
      for (k = n - 1; k >= 0; k--) {
        for (j = 0; j < count; j++) {
          X.set(k, j, X.get(k, j) / this.Rdiag[k]);
        }
        for (i = 0; i < k; i++) {
          for (j = 0; j < count; j++) {
            X.set(i, j, X.get(i, j) - X.get(k, j) * qr.get(i, k));
          }
        }
      }

      return X.subMatrix(0, n - 1, 0, count - 1);
    }

    isFullRank() {
      let columns = this.QR.columns;
      for (let i = 0; i < columns; i++) {
        if (this.Rdiag[i] === 0) {
          return false;
        }
      }
      return true;
    }

    get upperTriangularMatrix() {
      let qr = this.QR;
      let n = qr.columns;
      let X = new Matrix(n, n);
      let i, j;
      for (i = 0; i < n; i++) {
        for (j = 0; j < n; j++) {
          if (i < j) {
            X.set(i, j, qr.get(i, j));
          } else if (i === j) {
            X.set(i, j, this.Rdiag[i]);
          } else {
            X.set(i, j, 0);
          }
        }
      }
      return X;
    }

    get orthogonalMatrix() {
      let qr = this.QR;
      let rows = qr.rows;
      let columns = qr.columns;
      let X = new Matrix(rows, columns);
      let i, j, k, s;

      for (k = columns - 1; k >= 0; k--) {
        for (i = 0; i < rows; i++) {
          X.set(i, k, 0);
        }
        X.set(k, k, 1);
        for (j = k; j < columns; j++) {
          if (qr.get(k, k) !== 0) {
            s = 0;
            for (i = k; i < rows; i++) {
              s += qr.get(i, k) * X.get(i, j);
            }

            s = -s / qr.get(k, k);

            for (i = k; i < rows; i++) {
              X.set(i, j, X.get(i, j) + s * qr.get(i, k));
            }
          }
        }
      }
      return X;
    }
  }

  class SingularValueDecomposition {
    constructor(value, options = {}) {
      value = WrapperMatrix2D.checkMatrix(value);

      let m = value.rows;
      let n = value.columns;

      const {
        computeLeftSingularVectors = true,
        computeRightSingularVectors = true,
        autoTranspose = false,
      } = options;

      let wantu = Boolean(computeLeftSingularVectors);
      let wantv = Boolean(computeRightSingularVectors);

      let swapped = false;
      let a;
      if (m < n) {
        if (!autoTranspose) {
          a = value.clone();
          // eslint-disable-next-line no-console
          console.warn(
            'Computing SVD on a matrix with more columns than rows. Consider enabling autoTranspose',
          );
        } else {
          a = value.transpose();
          m = a.rows;
          n = a.columns;
          swapped = true;
          let aux = wantu;
          wantu = wantv;
          wantv = aux;
        }
      } else {
        a = value.clone();
      }

      let nu = Math.min(m, n);
      let ni = Math.min(m + 1, n);
      let s = new Float64Array(ni);
      let U = new Matrix(m, nu);
      let V = new Matrix(n, n);

      let e = new Float64Array(n);
      let work = new Float64Array(m);

      let si = new Float64Array(ni);
      for (let i = 0; i < ni; i++) si[i] = i;

      let nct = Math.min(m - 1, n);
      let nrt = Math.max(0, Math.min(n - 2, m));
      let mrc = Math.max(nct, nrt);

      for (let k = 0; k < mrc; k++) {
        if (k < nct) {
          s[k] = 0;
          for (let i = k; i < m; i++) {
            s[k] = hypotenuse(s[k], a.get(i, k));
          }
          if (s[k] !== 0) {
            if (a.get(k, k) < 0) {
              s[k] = -s[k];
            }
            for (let i = k; i < m; i++) {
              a.set(i, k, a.get(i, k) / s[k]);
            }
            a.set(k, k, a.get(k, k) + 1);
          }
          s[k] = -s[k];
        }

        for (let j = k + 1; j < n; j++) {
          if (k < nct && s[k] !== 0) {
            let t = 0;
            for (let i = k; i < m; i++) {
              t += a.get(i, k) * a.get(i, j);
            }
            t = -t / a.get(k, k);
            for (let i = k; i < m; i++) {
              a.set(i, j, a.get(i, j) + t * a.get(i, k));
            }
          }
          e[j] = a.get(k, j);
        }

        if (wantu && k < nct) {
          for (let i = k; i < m; i++) {
            U.set(i, k, a.get(i, k));
          }
        }

        if (k < nrt) {
          e[k] = 0;
          for (let i = k + 1; i < n; i++) {
            e[k] = hypotenuse(e[k], e[i]);
          }
          if (e[k] !== 0) {
            if (e[k + 1] < 0) {
              e[k] = 0 - e[k];
            }
            for (let i = k + 1; i < n; i++) {
              e[i] /= e[k];
            }
            e[k + 1] += 1;
          }
          e[k] = -e[k];
          if (k + 1 < m && e[k] !== 0) {
            for (let i = k + 1; i < m; i++) {
              work[i] = 0;
            }
            for (let i = k + 1; i < m; i++) {
              for (let j = k + 1; j < n; j++) {
                work[i] += e[j] * a.get(i, j);
              }
            }
            for (let j = k + 1; j < n; j++) {
              let t = -e[j] / e[k + 1];
              for (let i = k + 1; i < m; i++) {
                a.set(i, j, a.get(i, j) + t * work[i]);
              }
            }
          }
          if (wantv) {
            for (let i = k + 1; i < n; i++) {
              V.set(i, k, e[i]);
            }
          }
        }
      }

      let p = Math.min(n, m + 1);
      if (nct < n) {
        s[nct] = a.get(nct, nct);
      }
      if (m < p) {
        s[p - 1] = 0;
      }
      if (nrt + 1 < p) {
        e[nrt] = a.get(nrt, p - 1);
      }
      e[p - 1] = 0;

      if (wantu) {
        for (let j = nct; j < nu; j++) {
          for (let i = 0; i < m; i++) {
            U.set(i, j, 0);
          }
          U.set(j, j, 1);
        }
        for (let k = nct - 1; k >= 0; k--) {
          if (s[k] !== 0) {
            for (let j = k + 1; j < nu; j++) {
              let t = 0;
              for (let i = k; i < m; i++) {
                t += U.get(i, k) * U.get(i, j);
              }
              t = -t / U.get(k, k);
              for (let i = k; i < m; i++) {
                U.set(i, j, U.get(i, j) + t * U.get(i, k));
              }
            }
            for (let i = k; i < m; i++) {
              U.set(i, k, -U.get(i, k));
            }
            U.set(k, k, 1 + U.get(k, k));
            for (let i = 0; i < k - 1; i++) {
              U.set(i, k, 0);
            }
          } else {
            for (let i = 0; i < m; i++) {
              U.set(i, k, 0);
            }
            U.set(k, k, 1);
          }
        }
      }

      if (wantv) {
        for (let k = n - 1; k >= 0; k--) {
          if (k < nrt && e[k] !== 0) {
            for (let j = k + 1; j < n; j++) {
              let t = 0;
              for (let i = k + 1; i < n; i++) {
                t += V.get(i, k) * V.get(i, j);
              }
              t = -t / V.get(k + 1, k);
              for (let i = k + 1; i < n; i++) {
                V.set(i, j, V.get(i, j) + t * V.get(i, k));
              }
            }
          }
          for (let i = 0; i < n; i++) {
            V.set(i, k, 0);
          }
          V.set(k, k, 1);
        }
      }

      let pp = p - 1;
      let eps = Number.EPSILON;
      while (p > 0) {
        let k, kase;
        for (k = p - 2; k >= -1; k--) {
          if (k === -1) {
            break;
          }
          const alpha =
            Number.MIN_VALUE + eps * Math.abs(s[k] + Math.abs(s[k + 1]));
          if (Math.abs(e[k]) <= alpha || Number.isNaN(e[k])) {
            e[k] = 0;
            break;
          }
        }
        if (k === p - 2) {
          kase = 4;
        } else {
          let ks;
          for (ks = p - 1; ks >= k; ks--) {
            if (ks === k) {
              break;
            }
            let t =
              (ks !== p ? Math.abs(e[ks]) : 0) +
              (ks !== k + 1 ? Math.abs(e[ks - 1]) : 0);
            if (Math.abs(s[ks]) <= eps * t) {
              s[ks] = 0;
              break;
            }
          }
          if (ks === k) {
            kase = 3;
          } else if (ks === p - 1) {
            kase = 1;
          } else {
            kase = 2;
            k = ks;
          }
        }

        k++;

        switch (kase) {
          case 1: {
            let f = e[p - 2];
            e[p - 2] = 0;
            for (let j = p - 2; j >= k; j--) {
              let t = hypotenuse(s[j], f);
              let cs = s[j] / t;
              let sn = f / t;
              s[j] = t;
              if (j !== k) {
                f = -sn * e[j - 1];
                e[j - 1] = cs * e[j - 1];
              }
              if (wantv) {
                for (let i = 0; i < n; i++) {
                  t = cs * V.get(i, j) + sn * V.get(i, p - 1);
                  V.set(i, p - 1, -sn * V.get(i, j) + cs * V.get(i, p - 1));
                  V.set(i, j, t);
                }
              }
            }
            break;
          }
          case 2: {
            let f = e[k - 1];
            e[k - 1] = 0;
            for (let j = k; j < p; j++) {
              let t = hypotenuse(s[j], f);
              let cs = s[j] / t;
              let sn = f / t;
              s[j] = t;
              f = -sn * e[j];
              e[j] = cs * e[j];
              if (wantu) {
                for (let i = 0; i < m; i++) {
                  t = cs * U.get(i, j) + sn * U.get(i, k - 1);
                  U.set(i, k - 1, -sn * U.get(i, j) + cs * U.get(i, k - 1));
                  U.set(i, j, t);
                }
              }
            }
            break;
          }
          case 3: {
            const scale = Math.max(
              Math.abs(s[p - 1]),
              Math.abs(s[p - 2]),
              Math.abs(e[p - 2]),
              Math.abs(s[k]),
              Math.abs(e[k]),
            );
            const sp = s[p - 1] / scale;
            const spm1 = s[p - 2] / scale;
            const epm1 = e[p - 2] / scale;
            const sk = s[k] / scale;
            const ek = e[k] / scale;
            const b = ((spm1 + sp) * (spm1 - sp) + epm1 * epm1) / 2;
            const c = sp * epm1 * (sp * epm1);
            let shift = 0;
            if (b !== 0 || c !== 0) {
              if (b < 0) {
                shift = 0 - Math.sqrt(b * b + c);
              } else {
                shift = Math.sqrt(b * b + c);
              }
              shift = c / (b + shift);
            }
            let f = (sk + sp) * (sk - sp) + shift;
            let g = sk * ek;
            for (let j = k; j < p - 1; j++) {
              let t = hypotenuse(f, g);
              if (t === 0) t = Number.MIN_VALUE;
              let cs = f / t;
              let sn = g / t;
              if (j !== k) {
                e[j - 1] = t;
              }
              f = cs * s[j] + sn * e[j];
              e[j] = cs * e[j] - sn * s[j];
              g = sn * s[j + 1];
              s[j + 1] = cs * s[j + 1];
              if (wantv) {
                for (let i = 0; i < n; i++) {
                  t = cs * V.get(i, j) + sn * V.get(i, j + 1);
                  V.set(i, j + 1, -sn * V.get(i, j) + cs * V.get(i, j + 1));
                  V.set(i, j, t);
                }
              }
              t = hypotenuse(f, g);
              if (t === 0) t = Number.MIN_VALUE;
              cs = f / t;
              sn = g / t;
              s[j] = t;
              f = cs * e[j] + sn * s[j + 1];
              s[j + 1] = -sn * e[j] + cs * s[j + 1];
              g = sn * e[j + 1];
              e[j + 1] = cs * e[j + 1];
              if (wantu && j < m - 1) {
                for (let i = 0; i < m; i++) {
                  t = cs * U.get(i, j) + sn * U.get(i, j + 1);
                  U.set(i, j + 1, -sn * U.get(i, j) + cs * U.get(i, j + 1));
                  U.set(i, j, t);
                }
              }
            }
            e[p - 2] = f;
            break;
          }
          case 4: {
            if (s[k] <= 0) {
              s[k] = s[k] < 0 ? -s[k] : 0;
              if (wantv) {
                for (let i = 0; i <= pp; i++) {
                  V.set(i, k, -V.get(i, k));
                }
              }
            }
            while (k < pp) {
              if (s[k] >= s[k + 1]) {
                break;
              }
              let t = s[k];
              s[k] = s[k + 1];
              s[k + 1] = t;
              if (wantv && k < n - 1) {
                for (let i = 0; i < n; i++) {
                  t = V.get(i, k + 1);
                  V.set(i, k + 1, V.get(i, k));
                  V.set(i, k, t);
                }
              }
              if (wantu && k < m - 1) {
                for (let i = 0; i < m; i++) {
                  t = U.get(i, k + 1);
                  U.set(i, k + 1, U.get(i, k));
                  U.set(i, k, t);
                }
              }
              k++;
            }
            p--;
            break;
          }
          // no default
        }
      }

      if (swapped) {
        let tmp = V;
        V = U;
        U = tmp;
      }

      this.m = m;
      this.n = n;
      this.s = s;
      this.U = U;
      this.V = V;
    }

    solve(value) {
      let Y = value;
      let e = this.threshold;
      let scols = this.s.length;
      let Ls = Matrix.zeros(scols, scols);

      for (let i = 0; i < scols; i++) {
        if (Math.abs(this.s[i]) <= e) {
          Ls.set(i, i, 0);
        } else {
          Ls.set(i, i, 1 / this.s[i]);
        }
      }

      let U = this.U;
      let V = this.rightSingularVectors;

      let VL = V.mmul(Ls);
      let vrows = V.rows;
      let urows = U.rows;
      let VLU = Matrix.zeros(vrows, urows);

      for (let i = 0; i < vrows; i++) {
        for (let j = 0; j < urows; j++) {
          let sum = 0;
          for (let k = 0; k < scols; k++) {
            sum += VL.get(i, k) * U.get(j, k);
          }
          VLU.set(i, j, sum);
        }
      }

      return VLU.mmul(Y);
    }

    solveForDiagonal(value) {
      return this.solve(Matrix.diag(value));
    }

    inverse() {
      let V = this.V;
      let e = this.threshold;
      let vrows = V.rows;
      let vcols = V.columns;
      let X = new Matrix(vrows, this.s.length);

      for (let i = 0; i < vrows; i++) {
        for (let j = 0; j < vcols; j++) {
          if (Math.abs(this.s[j]) > e) {
            X.set(i, j, V.get(i, j) / this.s[j]);
          }
        }
      }

      let U = this.U;

      let urows = U.rows;
      let ucols = U.columns;
      let Y = new Matrix(vrows, urows);

      for (let i = 0; i < vrows; i++) {
        for (let j = 0; j < urows; j++) {
          let sum = 0;
          for (let k = 0; k < ucols; k++) {
            sum += X.get(i, k) * U.get(j, k);
          }
          Y.set(i, j, sum);
        }
      }

      return Y;
    }

    get condition() {
      return this.s[0] / this.s[Math.min(this.m, this.n) - 1];
    }

    get norm2() {
      return this.s[0];
    }

    get rank() {
      let tol = Math.max(this.m, this.n) * this.s[0] * Number.EPSILON;
      let r = 0;
      let s = this.s;
      for (let i = 0, ii = s.length; i < ii; i++) {
        if (s[i] > tol) {
          r++;
        }
      }
      return r;
    }

    get diagonal() {
      return Array.from(this.s);
    }

    get threshold() {
      return (Number.EPSILON / 2) * Math.max(this.m, this.n) * this.s[0];
    }

    get leftSingularVectors() {
      return this.U;
    }

    get rightSingularVectors() {
      return this.V;
    }

    get diagonalMatrix() {
      return Matrix.diag(this.s);
    }
  }

  function inverse(matrix, useSVD = false) {
    matrix = WrapperMatrix2D.checkMatrix(matrix);
    if (useSVD) {
      return new SingularValueDecomposition(matrix).inverse();
    } else {
      return solve(matrix, Matrix.eye(matrix.rows));
    }
  }

  function solve(leftHandSide, rightHandSide, useSVD = false) {
    leftHandSide = WrapperMatrix2D.checkMatrix(leftHandSide);
    rightHandSide = WrapperMatrix2D.checkMatrix(rightHandSide);
    if (useSVD) {
      return new SingularValueDecomposition(leftHandSide).solve(rightHandSide);
    } else {
      return leftHandSide.isSquare()
        ? new LuDecomposition(leftHandSide).solve(rightHandSide)
        : new QrDecomposition(leftHandSide).solve(rightHandSide);
    }
  }

  /**
   * Difference of the matrix function over the parameters
   * @ignore
   * @param {{x:Array<number>, y:Array<number>}} data - Array of points to fit in the format [x1, x2, ... ], [y1, y2, ... ]
   * @param {Array<number>} evaluatedData - Array of previous evaluated function values
   * @param {Array<number>} params - Array of previous parameter values
   * @param {number} gradientDifference - Adjustment for decrease the damping parameter
   * @param {function} paramFunction - The parameters and returns a function with the independent variable as a parameter
   * @return {Matrix}
   */
  function gradientFunction(
    data,
    evaluatedData,
    params,
    gradientDifference,
    paramFunction,
  ) {
    const n = params.length;
    const m = data.x.length;

    let ans = new Array(n);

    for (let param = 0; param < n; param++) {
      ans[param] = new Array(m);
      let auxParams = params.slice();
      auxParams[param] += gradientDifference;
      let funcParam = paramFunction(auxParams);

      for (let point = 0; point < m; point++) {
        ans[param][point] = evaluatedData[point] - funcParam(data.x[point]);
      }
    }
    return new Matrix(ans);
  }

  /**
   * Matrix function over the samples
   * @ignore
   * @param {{x:Array<number>, y:Array<number>}} data - Array of points to fit in the format [x1, x2, ... ], [y1, y2, ... ]
   * @param {Array<number>} evaluatedData - Array of previous evaluated function values
   * @return {Matrix}
   */
  function matrixFunction(data, evaluatedData) {
    const m = data.x.length;

    let ans = new Array(m);

    for (let point = 0; point < m; point++) {
      ans[point] = [data.y[point] - evaluatedData[point]];
    }

    return new Matrix(ans);
  }

  /**
   * Iteration for Levenberg-Marquardt
   * @ignore
   * @param {{x:Array<number>, y:Array<number>}} data - Array of points to fit in the format [x1, x2, ... ], [y1, y2, ... ]
   * @param {Array<number>} params - Array of previous parameter values
   * @param {number} damping - Levenberg-Marquardt parameter
   * @param {number} gradientDifference - Adjustment for decrease the damping parameter
   * @param {function} parameterizedFunction - The parameters and returns a function with the independent variable as a parameter
   * @return {Array<number>}
   */
  function step(
    data,
    params,
    damping,
    gradientDifference,
    parameterizedFunction,
  ) {
    let value = damping * gradientDifference * gradientDifference;
    let identity = Matrix.eye(params.length, params.length, value);

    const func = parameterizedFunction(params);

    let evaluatedData = new Float64Array(data.x.length);
    for (let i = 0; i < data.x.length; i++) {
      evaluatedData[i] = func(data.x[i]);
    }

    let gradientFunc = gradientFunction(
      data,
      evaluatedData,
      params,
      gradientDifference,
      parameterizedFunction,
    );
    let matrixFunc = matrixFunction(data, evaluatedData);
    let inverseMatrix = inverse(
      identity.add(gradientFunc.mmul(gradientFunc.transpose())),
    );

    params = new Matrix([params]);
    params = params.sub(
      inverseMatrix
        .mmul(gradientFunc)
        .mmul(matrixFunc)
        .mul(gradientDifference)
        .transpose(),
    );

    return params.to1DArray();
  }

  /**
   * Curve fitting algorithm
   * @param {{x:Array<number>, y:Array<number>}} data - Array of points to fit in the format [x1, x2, ... ], [y1, y2, ... ]
   * @param {function} parameterizedFunction - The parameters and returns a function with the independent variable as a parameter
   * @param {object} [options] - Options object
   * @param {number} [options.damping] - Levenberg-Marquardt parameter
   * @param {number} [options.gradientDifference = 10e-2] - Adjustment for decrease the damping parameter
   * @param {Array<number>} [options.minValues] - Minimum allowed values for parameters
   * @param {Array<number>} [options.maxValues] - Maximum allowed values for parameters
   * @param {Array<number>} [options.initialValues] - Array of initial parameter values
   * @param {number} [options.maxIterations = 100] - Maximum of allowed iterations
   * @param {number} [options.errorTolerance = 10e-3] - Minimum uncertainty allowed for each point
   * @return {{parameterValues: Array<number>, parameterError: number, iterations: number}}
   */
  function levenbergMarquardt(
    data,
    parameterizedFunction,
    options = {},
  ) {
    let {
      maxIterations = 100,
      gradientDifference = 10e-2,
      damping = 0,
      errorTolerance = 10e-3,
      minValues,
      maxValues,
      initialValues,
    } = options;

    if (damping <= 0) {
      throw new Error('The damping option must be a positive number');
    } else if (!data.x || !data.y) {
      throw new Error('The data parameter must have x and y elements');
    } else if (
      !isAnyArray(data.x) ||
      data.x.length < 2 ||
      !isAnyArray(data.y) ||
      data.y.length < 2
    ) {
      throw new Error(
        'The data parameter elements must be an array with more than 2 points',
      );
    } else if (data.x.length !== data.y.length) {
      throw new Error('The data parameter elements must have the same size');
    }

    let parameters =
      initialValues || new Array(parameterizedFunction.length).fill(1);
    let parLen = parameters.length;
    maxValues = maxValues || new Array(parLen).fill(Number.MAX_SAFE_INTEGER);
    minValues = minValues || new Array(parLen).fill(Number.MIN_SAFE_INTEGER);

    if (maxValues.length !== minValues.length) {
      throw new Error('minValues and maxValues must be the same size');
    }

    if (!isAnyArray(parameters)) {
      throw new Error('initialValues must be an array');
    }

    let error = errorCalculation(data, parameters, parameterizedFunction);

    let converged = error <= errorTolerance;

    let iteration;
    for (iteration = 0; iteration < maxIterations && !converged; iteration++) {
      parameters = step(
        data,
        parameters,
        damping,
        gradientDifference,
        parameterizedFunction,
      );

      for (let k = 0; k < parLen; k++) {
        parameters[k] = Math.min(
          Math.max(minValues[k], parameters[k]),
          maxValues[k],
        );
      }

      error = errorCalculation(data, parameters, parameterizedFunction);
      if (isNaN(error)) break;
      converged = error <= errorTolerance;
    }

    return {
      parameterValues: parameters,
      parameterError: error,
      iterations: iteration,
    };
  }

  /** get version info*/
  function version() {
      return "v0.1.3";
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
      var res = levenbergMarquardt({ x: x, y: y }, polynomial, options);
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
      t.forEach(v => { res.t.push(Number(v)); });
      res.r = [];
      r.forEach(v => { res.r.push(Number(v)); });

      return res;
  }


  /** get min, max, sum, avg */
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

  /** calculate derivative (pre-check and conversion to numbers already done) */
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
      // get first derivative
      var d = derivative(t, r);
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
  function smooth(c, sigma) {
      // console.log("smooth: starting");
      var s = c.r.map(v => 0);
      // console.log(s);
      for (var i = 0; i < c.r.length; i++) {
          var t0 = c.t[i];
          var lb = t0 - 3.0 * sigma;
          var ub = t0 + 3.0 * sigma;
          var f = c.r.map(v => 0); // filter function
          var sum = 0;
          var sum_f = 0;
          // var cnt = 0;
          // console.log(lb, ub);
          for (var j = 0; j < c.r.length; j++) {
              if (c.t[j] >= lb && c.t[j] <= ub) {
                  f[j] = 
                      Math.exp(
                          -Math.pow(c.t[j] - t0, 2)
                          / 2.0
                          / Math.pow(sigma, 2)
                      )
                      / sigma / Math.sqrt(2.0 * Math.PI);
                  sum += f[j] * c.r[j];
                  sum_f += f[j];
                  // cnt++;
                  // console.log("f,c,sum,sum_f", f[j], c.r[j], sum, sum_f);
              }
          }
          s[i] = sum / sum_f;
      }
      c.s = s;
      //console.log(f);
      //console.log(s);
      return c; // for chaining
  }

  /** get base notions from time series (time t and observation r) */
  function characteristics(t, r) {

      var res = checkconv(t, r);

      /** basic descriptive statistics */
      var mms = minmaxsum(res.r);
      res.r_mms = mms;

      /** lift into positive range */
      res.r_lift_min = [];
      res.r.forEach(v => { res.r_lift_min.push(v - res.r_mms.min); });

      /** lift by mean */
      res.r_lift_avg = [];
      res.r.forEach(v => { res.r_lift_avg.push(v - res.r_mms.avg); });
      res.sum_r_lifted_sq = 0;
      res.r_lift_avg.forEach(v => { res.sum_r_lifted_sq += v * v; });

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
      // console.log("r2", r2);
      // console.log("min", res.r_min, "max", res.r_max);
      var lb = res.r_mms.min;
      var hb = res.r_mms.min + (res.r_mms.max - res.r_mms.min) * 0.25;
      res.r_bin_1 = res.r.filter(v => v >= lb && v < hb).length; //count of values in first 25%
      // console.log("lb", lb, "hb", hb, "v", r2.filter(v => v >= lb && v < hb), "res", res.r_bin_1);
      lb = res.r_mms.min + (res.r_mms.max - res.r_mms.min) * 0.25;
      hb = res.r_mms.min + (res.r_mms.max - res.r_mms.min) * 0.50;
      res.r_bin_2 = res.r.filter(v => v >= lb && v < hb).length;
      // console.log("lb", lb, "hb", hb, "v", r2.filter(v => v >= lb && v < hb), "res", res.r_bin_2);
      lb = res.r_mms.min + (res.r_mms.max - res.r_mms.min) * 0.50;
      hb = res.r_mms.min + (res.r_mms.max - res.r_mms.min) * 0.75;
      res.r_bin_3 = res.r.filter(v => v >= lb && v < hb).length;
      // console.log("lb", lb, "hb", hb, "v", r2.filter(v => v >= lb && v < hb), "res", res.r_bin_3);
      lb = res.r_mms.min + (res.r_mms.max - res.r_mms.min) * 0.75;
      hb = res.r_mms.min + (res.r_mms.max - res.r_mms.min) * 1.0;
      res.r_bin_4 = res.r.filter(v => v >= lb && v <= hb).length;
      // console.log("lb", lb, "hb", hb, "v", r2.filter(v => v >= lb && v <= hb), "res", res.r_bin_4);

      return res;
  }

  exports.autocorrelation = autocorrelation;
  exports.characteristics = characteristics;
  exports.checkconv = checkconv;
  exports.derivative = derivative;
  exports.fit_polynomial = fit_polynomial;
  exports.minmaxsum = minmaxsum;
  exports.moment = moment;
  exports.polynomial_1 = polynomial_1;
  exports.polynomial_2 = polynomial_2;
  exports.polynomial_3 = polynomial_3;
  exports.polynomial_4 = polynomial_4;
  exports.polynomial_5 = polynomial_5;
  exports.quantile = quantile;
  exports.roots = roots;
  exports.smooth = smooth;
  exports.version = version;

  Object.defineProperty(exports, '__esModule', { value: true });

})));
