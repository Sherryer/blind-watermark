#include <stdio.h>
#include <math.h>
#include <string.h>
#include <stdlib.h>

void printArr(int length, float* signal) {
    for (int i = 0; i < length; ++i) {
        printf("\n");
        for (int j = 0; j < length; ++j) {
            printf(" %4.32lf", signal[i*length + j]);
        }
    }\
    printf("\n");
}

float IDCT(int length, float signal[length][length], float res[length][length]) {
    float coff[length];
    coff[0] = 1 / sqrt(length);
    float other = sqrt(2) / sqrt(length);
    for (int i = 1; i < length; ++i) {
        coff[i] = other;
    }

    float tmp[length * length];
    memset(tmp, 0, sizeof(float)*length*length);
    float PI = acos(-1);

    for (int i = 0; i < length; i++) {
        for (int j = 0; j < length; j++) {
            for (int x = 0; x < length; x++) {
                tmp[i * length + j] += coff[x] * signal[i][x] * cos((2 * j + 1) * x * PI / 2 / length);
            }
        }
    }

    for (int i = 0; i < length; i++) {
        for (int j = 0; j < length; j++) {
            for (int x = 0; x < length; x++) {
                res[i][j] = res[i][j]  + coff[x] * tmp[x * length + j] * cos((2 * i + 1) * x * PI / 2 / length);
            }
        }
    }
    return 0;
}

float DCT(int length, float signal[length][length], float res[length][length]) {

    float coff[length];
    coff[0] = 1 / sqrt(length);
    float other = sqrt(2) / sqrt(length);
    for (int i = 1; i < length; ++i) {
        coff[i] = other;
    }

    float tmp[length * length];
    memset(tmp, 0, sizeof(float)*length*length);
    float PI = acos(-1);

    for (int i = 0; i < length; i++) {
        for (int j = 0; j < length; j++) {
            for (int x = 0; x < length; x++) {
                tmp[i * length + j] += coff[j] * signal[i][x] * cos((2 * x + 1) * PI * j / 2 / length);
            }
        }
    }

    for (int i = 0; i < length; i++) {
        for (int j = 0; j < length; j++) {
            for (int x = 0; x < length; x++) {
                res[i][j] = res[i][j] + coff[i] * tmp[x * length + j] * cos((2 * x + 1) * PI * i / 2 / length);
            }
        }
    };

    return 0;
}

float* DctTrans(int length, float* signal) {
    if(!signal) return NULL;
    float coff[length];
    coff[0] = 1 / sqrt(length);
    float other = sqrt(2) / sqrt(length);
    for (int i = 1; i < length; ++i) {
        coff[i] = other;
    }

    // create res
    float *res = malloc(sizeof(float)*length*length);
    memset(res, 0, sizeof(float)*length*length);

    float tmp[length * length];
    memset(tmp, 0, sizeof(float)*length*length);
    float PI = acos(-1);

    for (int i = 0; i < length; i++) {
        for (int j = 0; j < length; j++) {
            for (int x = 0; x < length; x++) {
                tmp[i * length + j] += coff[j] * signal[i*length + x] * cos((2 * x + 1) * PI * j / 2 / length);
            }
        }
    }

    for (int i = 0; i < length; i++) {
        for (int j = 0; j < length; j++) {
            for (int x = 0; x < length; x++) {
                res[i*length + j] = res[i*length + j] + coff[i] * tmp[x * length + j] * cos((2 * x + 1) * PI * i / 2 / length);
            }
        }
    };

    return res;
}


float *IdetTrams(int length, float* signal) {
    if(!signal) return NULL;
    float coff[length];
    coff[0] = 1 / sqrt(length);
    float other = sqrt(2) / sqrt(length);
    for (int i = 1; i < length; ++i) {
        coff[i] = other;
    }

    float tmp[length * length];
    memset(tmp, 0, sizeof(float)*length*length);
    // create res
    float *res = malloc(sizeof(float)*length*length);
    memset(res, 0, sizeof(float)*length*length);
    float PI = acos(-1);

    for (int i = 0; i < length; i++) {
        for (int j = 0; j < length; j++) {
            for (int x = 0; x < length; x++) {
                tmp[i * length + j] += coff[x] * signal[i*length + x] * cos((2 * j + 1) * x * PI / 2 / length);
            }
        }
    }

    for (int i = 0; i < length; i++) {
        for (int j = 0; j < length; j++) {
            for (int x = 0; x < length; x++) {
                res[i*length + j] = res[i*length + j]  + coff[x] * tmp[x * length + j] * cos((2 * i + 1) * x * PI / 2 / length);
            }
        }
    }
    return res;
}
