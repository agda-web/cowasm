#define EXPORTED_SYMBOL __attribute__((visibility("default")))

struct PyObjectX {
  int thingy;
};

typedef struct PyObjectX PyObject;

extern
PyObject _Py_NoneStruct;

#define PyNone (&_Py_NoneStruct)
typedef PyObject *(*PyCFunction)(PyObject *, PyObject *);

struct PyMethodDef {
  char *name;
  PyCFunction f;
};

struct PyModuleDef {
  char *m_name;
  struct PyMethodDef* m_methods;
};

extern int PyModuleDef_Init(struct PyModuleDef* module);


