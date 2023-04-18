function copyMatrix(matrix) {
  return matrix.map((row) => row.slice());
}

const cleanMatrix = Array.from({ length: 4 }, () => Array(4).fill(0.0));
const identityMatrix = copyMatrix(cleanMatrix);

identityMatrix[0][0] = 1.0;
identityMatrix[1][1] = 1.0;
identityMatrix[2][2] = 1.0;
identityMatrix[3][3] = 1.0;

function multiplyMatrices(xMatrix, yMatrix) {
  let resultMatrix = copyMatrix(cleanMatrix);

  for (let i = 0; i < 4; i++) {
    for (let j = 0; j < 4; j++) {
      resultMatrix[i][j] =
        xMatrix[0][j] * yMatrix[i][0] +
        xMatrix[1][j] * yMatrix[i][1] +
        xMatrix[2][j] * yMatrix[i][2] +
        xMatrix[3][j] * yMatrix[i][3];
    }
  }

  return resultMatrix;
}

function radians(degrees) {
  var pi = Math.PI;
  return degrees * (pi / 180);
}

class Matrix {
  constructor(base = null) {
    if (typeof base === "Matrix") {
      this.data = copyMatrix(base.data);
    } else if (typeof base === "array") {
      this.data = copyMatrix(base);
    } else if (typeof base === "object" && base !== null) {
      this.data = copyMatrix(base);
    } else {
      this.data = copyMatrix(identityMatrix);
    }
  }

  loadIdentity() {
    this.data = copyMatrix(identityMatrix);
  }

  multiply(other) {
    return new Matrix(multiplyMatrices(this.data, other.data));
  }

  inplaceMultiply(other) {
    this.data = multiplyMatrices(this.data, other.data);
  }

  [Symbol.for("operator.multiply")](other) {
    return multiplyMatrices(this.data, other.data);
  }

  [Symbol.for("operator.multiplyAssign")](other) {
    this.data = multiplyMatrices(this.data, other.data);
  }

  scale(x, y, z) {
    for (let i = 0; i < 4; i++) {
      this.data[0][i] *= x;
    }
    for (let i = 0; i < 4; i++) {
      this.data[1][i] *= y;
    }
    for (let i = 0; i < 4; i++) {
      this.data[2][i] *= z;
    }
  }

  translate(x, y, z) {
    for (let i = 0; i < 4; i++) {
      this.data[3][i] +=
        this.data[0][i] * x + this.data[1][i] * y + this.data[2][i] * z;
    }
  }

  rotate(angle, x, y, z) {
    const magnitude = Math.sqrt(x * x + y * y + z * z);

    x /= -magnitude;
    y /= -magnitude;
    z /= -magnitude;

    const sinAngle = Math.sin(angle);
    const cosAngle = Math.cos(angle);
    const oneMinusCos = 1.0 - cosAngle;

    const xx = x * x;
    const yy = y * y;
    const zz = z * z;

    const xy = x * y;
    const yz = y * z;
    const zx = z * x;

    const xs = x * sinAngle;
    const ys = y * sinAngle;
    const zs = z * sinAngle;

    const rotationMatrix = copyMatrix(cleanMatrix);

    rotationMatrix[0][0] = oneMinusCos * xx + cosAngle;
    rotationMatrix[0][1] = oneMinusCos * xy - zs;
    rotationMatrix[0][2] = oneMinusCos * zx + ys;

    rotationMatrix[1][0] = oneMinusCos * xy + zs;
    rotationMatrix[1][1] = oneMinusCos * yy + cosAngle;
    rotationMatrix[1][2] = oneMinusCos * yz - xs;

    rotationMatrix[2][0] = oneMinusCos * zx - ys;
    rotationMatrix[2][1] = oneMinusCos * yz + xs;
    rotationMatrix[2][2] = oneMinusCos * zz + cosAngle;

    rotationMatrix[3][3] = 1.0;
    this.data = multiplyMatrices(this.data, rotationMatrix);
  }

  rotate2d(x, y) {
    this.rotate(x, 0, 1.0, 0);
    this.rotate(-y, Math.cos(x), 0, Math.sin(x));
  }

  frustum(left, right, bottom, top, near, far) {
    const deltax = right - left;
    const deltay = top - bottom;
    const deltaz = far - near;

    const frustumMatrix = copyMatrix(cleanMatrix);

    frustumMatrix[0][0] = (2 * near) / deltax;
    frustumMatrix[1][1] = (2 * near) / deltay;

    frustumMatrix[2][0] = (right + left) / deltax;
    frustumMatrix[2][1] = (top + bottom) / deltay;
    frustumMatrix[2][2] = -(near + far) / deltaz;

    frustumMatrix[2][3] = -1.0;
    frustumMatrix[3][2] = (-2 * near * far) / deltaz;

    this.data = multiplyMatrices(this.data, frustumMatrix);
  }

  perspective(fovy, aspect, near, far) {
    const frustum_y = Math.tan(radians(fovy) / 2);
    const frustum_x = frustum_y * aspect;

    this.frustum(
      -frustum_x * near,
      frustum_x * near,
      -frustum_y * near,
      frustum_y * near,
      near,
      far
    );
  }

  orthographic(left, right, bottom, top, near, far) {
    const deltax = right - left;
    const deltay = top - bottom;
    const deltaz = far - near;

    const orthographicMatrix = copyMatrix(cleanMatrix);

    orthographicMatrix[0][0] = 2 / deltax;
    orthographicMatrix[3][0] = -(right + left) / deltax;

    orthographicMatrix[1][1] = 2 / deltay;
    orthographicMatrix[3][1] = -(top + bottom) / deltay;

    orthographicMatrix[2][2] = -2 / deltaz;
    orthographicMatrix[3][2] = -(near + far) / deltaz;

    this.data = multiplyMatrices(this.data, orthographicMatrix);
  }
}

export default Matrix;
