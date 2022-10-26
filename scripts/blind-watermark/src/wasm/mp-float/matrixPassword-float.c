#include <stdio.h>
#include <string.h>
#include <stdlib.h>
#include <math.h>
#include "./methods/svd-float.c"
#include "./methods/dct-float.c"
#include <emscripten/emscripten.h>

//emcc -o matrixPassword.html matrixPassword.c -s EXPORTED_FUNCTIONS="['_main', '_free', '_malloc']"

float** squareMatrixDot(float **a, float ** b, int length) {
    float **result = Make2DArray(length, length);
    for (int i = 0; i < length; ++i) {
        for (int j = 0; j < length; ++j) {
            for (int k = 0; k < length; ++k) {
                result[i][j] += a[i][k] * b[k][j];
            }
        }
    }
    Free2DArray(a, length);
    Free2DArray(b, length);
    return result;
}

float **squareMatrixTransform(float **a, int length) {
    float **result = Make2DArray(length, length);
    for (int i = 0; i < length; ++i) {
        for (int j = 0; j < length; ++j) {
            result[j][i] = a[i][j];
        }
    }
    Free2DArray(a, length);
    return result;
}

float **diag(float *a, int length) {
    float** result = Make2DArray(length, length);
    for (int i = 0; i < length; ++i) {
        for (int j = 0; j < length; ++j) {
            if (i == j) {
                result[i][j] = a[i];
            } else {
                result[i][j] = 0;
            }
        }
    }
    return result;
}

//int d1 = 36;
//int d2 = 20;

float mixRobust (float data, int robust, int noise) {
    return (floor(data / robust) + 0.25 + 0.5 * noise) * robust;
}

float* EMSCRIPTEN_KEEPALIVE encode(float *signal, int length, int password, int d1, int d2) {
//float* encode(float *signal, int length, int password) {

    // dct
    float* dct_res = DctTrans(length, signal);

//    printArr(length, dct_res);
//    printf("===");

    // init usv
    float** u = Make2DArray(length, length);
    float** v = Make2DArray(length, length);
    float* s = (float *)malloc(sizeof(float) * length);
    memset(s, 0, sizeof(float)*length);
    SetZero(v, length);

//    u 作为输入
    for (int i = 0; i < length; i++) {
        for (int j = 0; j < length; j++)
            u[i][j] = dct_res[i * length + j];
    }
    free(dct_res);
//    打印
//    p(u, length, length);
    dsvd(u, length, length, s, v);

//    printf("=== u ===\n"); p(u, length, length);
//    printf("=== v ===\n"); p(v, length, length);
//    printf("=== s ===\n"); printf("%f %f %f\n", s[0], s[1], s[2]);


    s[0] = mixRobust(s[0], d1, password);
    s[1] = mixRobust(s[1], d2, password);
    float **encodeSignal = squareMatrixDot(u, squareMatrixDot(diag(s, length), squareMatrixTransform(v, length), length), length);
    free(s);

    float prepareIdct[length * length];

    for (int i = 0; i < length; i++) {
        for (int j = 0; j < length; j++)
            prepareIdct[i * length + j] = encodeSignal[i][j];
    }

    float *idct_res = IdetTrams(length, prepareIdct);

    return idct_res;
}

float EMSCRIPTEN_KEEPALIVE decode (float *signal, int length, int d1, int d2) {
    // dct
    float* dct_res = DctTrans(length, signal);

    // init usv
    float** u = Make2DArray(length, length);
    float** v = Make2DArray(length, length);
    float* s = (float *)malloc(sizeof(float) * length);
    memset(s, 0, sizeof(float)*length);
    SetZero(v, length);

    for (int i = 0; i < length; i++) {
        for (int j = 0; j < length; j++)
            u[i][j] = dct_res[i * length + j];
    }
    free(dct_res);

    dsvd(u, length, length, s, v);

    int wm0 = fmod(s[0], d1) > (0.5 * d1);
    int wm1 = fmod(s[1], d2) > (0.5 * d2);

    return (3.0 * wm0 + wm1) / 4;
}

int *EMSCRIPTEN_KEEPALIVE free_buf(void* buf) {
//int * free_buf(void* buf) {
    free(buf);
    return 0;
}

int main() {
//    printf("ready to work 2");
//    int length = 4;
//    float signal[4*4] = {  340, 340, 340, 340,
//                            340, 340, 340, 340,
//                            340, 340, 340, 340,
//                            340, 340, 340, 340 };
//    float *idct_res = encode(signal, length, 1);
//    printArr(length, idct_res);
//    free(idct_res);
}
