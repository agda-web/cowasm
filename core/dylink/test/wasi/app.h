#define EXPORTED_SYMBOL __attribute__((visibility("default")))

struct PyObjectX {
  int thingy;
};

typedef struct PyObjectX PyObject;

extern
PyObject _Py_NoneStruct;

#define PyNone (&_Py_NoneStruct)

typedef int (*FUN_PTR)(int);
