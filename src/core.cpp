#ifdef __EMSCRIPTEN__
#include <emscripten/emscripten.h>
#endif

extern "C"
{
    EMSCRIPTEN_KEEPALIVE
    const char *getHelloMessage()
    {
        const char *str = "Hello, world! 2";
        return str;
    }
}