/*#ifdef __EMSCRIPTEN__
#include <emscripten/emscripten.h>
#endif

extern "C"
{
    EMSCRIPTEN_KEEPALIVE
    const char *getHelloMessage()
    {
        const char *str = "Hello, world! 2\n";
        return str;
    }
}*/

#include <ctime>
#include <chrono>
#include <iostream>

using namespace std;
using namespace std::chrono;

int main()
{
    high_resolution_clock::time_point start_time = high_resolution_clock::now();

    long r = time(NULL);
    for (long i = 0; i < 2000000000; ++i)
        r += i;
	cout << "Hello CMake. v2 " << r << endl;
    
    auto int_ms = duration_cast<milliseconds>(high_resolution_clock::now() - start_time);

    cout << ' ' << int_ms.count() << " ms\n";

	return 0;
}